"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Calendar, Loader2, Link as LinkIcon, Users } from "lucide-react"
import { format, addDays, parse, isValid, addHours, setMinutes } from "date-fns"
import ParticipantSelector from "./ParticipantSelector"
import { Contact } from "./ParticipantSelector/types"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface MeetingDetails {
  title: string
  date: Date
  time: string
  duration?: number
  participants: string[]
  emails?: (string | null)[]
  meetingLink?: string
  documentRequestSent?: boolean
  missingEmailIndex?: number
}

export function MeetingScheduler() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I'm your meeting assistant. I can help you schedule meetings, find contact information, and set up Google Meet calls. How can I help you today?",
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [scheduledMeetings, setScheduledMeetings] = useState<MeetingDetails[]>([])
  const [currentMeeting, setCurrentMeeting] = useState<MeetingDetails | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isParticipantSelectorOpen, setIsParticipantSelectorOpen] = useState(false)
  const [selectedParticipants, setSelectedParticipants] = useState<Contact[]>([])
  const [pendingMeetingDetails, setPendingMeetingDetails] = useState<MeetingDetails | null>(null)
  const [newContactName, setNewContactName] = useState<string | null>(null)
  const [recentlyAddedContacts, setRecentlyAddedContacts] = useState<Set<string>>(new Set())
  const [forceSchedule, setForceSchedule] = useState(false)

  // --- Google API Initialization ---
  useEffect(() => {
    const loadGapi = async () => {
      if (typeof window !== "undefined") {
        try {
          console.log("Starting to load gapi...")
          const { gapi } = await import('gapi-script')
          const initClient = () => {
            console.log("Initializing Google API client with scopes:", 
              'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/contacts https://www.googleapis.com/auth/contacts.readonly')
            
            gapi.client.init({
              apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
              clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
              discoveryDocs: [
                'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
                'https://www.googleapis.com/discovery/v1/apis/people/v1/rest'
              ],
              scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/contacts https://www.googleapis.com/auth/contacts.readonly',
            }).then(() => {
              console.log("Google API client initialized successfully!")
              // Check if People API is loaded
              if (gapi.client.people) {
                console.log("People API is available")
              } else {
                console.warn("People API is NOT available in gapi client")
              }
            }).catch((error: Error) => {
              console.error("Error initializing Google API:", error)
            })
          }
          console.log("Loading client:auth2...")
          gapi.load('client:auth2', initClient)
        } catch (error) {
          console.error("Error loading gapi:", error)
        }
      }
    }
    loadGapi()
  }, [])

  // --- Handle Add New Contact Event ---
  useEffect(() => {
    const handleAddNewContact = (event: CustomEvent) => {
      const { name } = event.detail;
      handleNewContactRequest(name);
    };

    window.addEventListener('addNewContact', handleAddNewContact as EventListener);
    
    return () => {
      window.removeEventListener('addNewContact', handleAddNewContact as EventListener);
    };
  }, []);

  // --- Utility: Ensure Auth2 Instance ---
  const getAuthInstance = async () => {
    const { gapi } = await import('gapi-script')
    let authInstance = gapi.auth2 && gapi.auth2.getAuthInstance ? gapi.auth2.getAuthInstance() : null
    console.log("getAuthInstance: current value:", authInstance)
    if (!authInstance) {
      console.log("Auth instance not found, initializing auth2...")
      console.log("Client ID used for auth2.init:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)
      await new Promise<void>((resolve) => {
        gapi.load('auth2', () => {
          gapi.auth2.init({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/contacts https://www.googleapis.com/auth/contacts.readonly',
          }).then(() => {
            console.log("auth2 initialized!")
            resolve()
          }).catch((error: any) => {
            console.error("Error initializing auth2:", error)
            resolve() // Resolve anyway to prevent hanging
          })
        })
      })
      authInstance = gapi.auth2.getAuthInstance()
      console.log("Auth instance after init:", authInstance)
    }
    return authInstance
  }

  // --- Create Google Contact ---
  const createGoogleContact = async (name: string, email: string): Promise<boolean> => {
    try {
      const { gapi } = await import('gapi-script')
      const authInstance = await getAuthInstance()
      console.log("Creating contact - Auth instance:", authInstance ? "Available" : "Not available")
      
      if (!authInstance) {
        console.error("Auth instance is null, cannot create contact")
        return false
      }
      
      if (!authInstance.isSignedIn.get()) {
        console.log("User not signed in, requesting sign-in...")
        await authInstance.signIn()
        console.log("Sign-in completed")
      }
      
      console.log(`Attempting to create Google contact for ${name} with email ${email}...`)
      
      // Check if People API is available
      if (!gapi.client.people) {
        console.error("People API not available in gapi client")
        // Try to load People API explicitly
        console.log("Attempting to load People API explicitly...")
        await gapi.client.load('https://www.googleapis.com/discovery/v1/apis/people/v1/rest')
        
        if (!gapi.client.people) {
          console.error("Still cannot load People API after explicit loading")
          return false
        }
        console.log("People API loaded explicitly")
      }
      
      // Split name into given name and family name if possible
      const nameParts = name.trim().split(/\s+/);
      const givenName = nameParts[0] || name;
      const familyName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      console.log("Contact creation payload:", {
        names: [{ 
          givenName,
          familyName
        }],
        emailAddresses: [{ value: email }],
        memberships: [{ contactGroupMembership: { contactGroupResourceName: "contactGroups/myContacts" } }]
      })
      
      // Using the exact format from the Google People API documentation
      const response = await gapi.client.people.people.createContact({
        personFields: "names,emailAddresses",
        resource: {
          names: [
            { 
              givenName,
              familyName
            }
          ],
          emailAddresses: [
            { 
              value: email 
            }
          ],
          // Adding to "My Contacts" group
          memberships: [
            {
              contactGroupMembership: {
                contactGroupResourceName: "contactGroups/myContacts"
              }
            }
          ]
        }
      })
      
      console.log("Contact creation response:", response)
      
      if (response.status === 200) {
        console.log(`Successfully created contact for ${name} with resource name: ${response.result.resourceName}`)
        
        // Add to recently added contacts
        setRecentlyAddedContacts(prev => {
          const updated = new Set(prev);
          updated.add(email);
          return updated;
        });
        
        return true
      } else {
        console.error(`Failed to create contact. Status: ${response.status}`)
        return false
      }
    } catch (error: unknown) {
      console.error("Detailed error creating Google contact:", error)
      if (error instanceof Error) {
        console.error("Error message:", error.message)
        if ('result' in error && typeof error.result === 'object' && error.result && 'error' in error.result) {
          console.error("API error details:", error.result.error)
        }
      }
      return false
    }
  }

  // --- Get Default Meeting Time (next hour) ---
  const getDefaultMeetingTime = (): string => {
    const now = new Date();
    const nextHour = addHours(now, 1);
    const roundedNextHour = setMinutes(nextHour, 0);
    return format(roundedNextHour, 'h:mm a');
  }

  // --- Check for Meeting Overlaps ---
  const checkForOverlaps = async (startDateTime: Date, endDateTime: Date): Promise<{hasOverlap: boolean, availableTimes: Date[]}> => {
    try {
      const { gapi } = await import('gapi-script');
      const authInstance = await getAuthInstance();
      if (authInstance && !authInstance.isSignedIn.get()) {
        await authInstance.signIn();
      }
      
      // Get events from calendar
      const timeMin = new Date(startDateTime);
      timeMin.setHours(0, 0, 0, 0); // Start of day
      
      const timeMax = new Date(startDateTime);
      timeMax.setHours(23, 59, 59, 999); // End of day
      
      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });
      
      const events = response.result.items || [];
      let hasOverlap = false;
      
      // Check if the proposed meeting overlaps with any existing events
      for (const event of events) {
        const eventStart = new Date(event.start.dateTime || event.start.date);
        const eventEnd = new Date(event.end.dateTime || event.end.date);
        
        if ((startDateTime < eventEnd && endDateTime > eventStart)) {
          hasOverlap = true;
          break;
        }
      }
      
      // Find available time slots if there's an overlap
      const availableTimes: Date[] = [];
      if (hasOverlap) {
        // Start checking from current time or start of business hours
        let currentTime = new Date();
        const businessStart = new Date(startDateTime);
        businessStart.setHours(9, 0, 0, 0);
        
        const checkTime = currentTime > businessStart ? currentTime : businessStart;
        
        // Check every 30 minutes until end of day
        const endOfDay = new Date(startDateTime);
        endOfDay.setHours(18, 0, 0, 0);
        
        const meetingDuration = (endDateTime.getTime() - startDateTime.getTime()) / 60000; // in minutes
        
        while (checkTime < endOfDay) {
          const potentialEndTime = new Date(checkTime);
          potentialEndTime.setMinutes(potentialEndTime.getMinutes() + meetingDuration);
          
          let isAvailable = true;
          for (const event of events) {
            const eventStart = new Date(event.start.dateTime || event.start.date);
            const eventEnd = new Date(event.end.dateTime || event.end.date);
            
            if ((checkTime < eventEnd && potentialEndTime > eventStart)) {
              isAvailable = false;
              // Jump to the end of this event
              checkTime.setTime(eventEnd.getTime());
              break;
            }
          }
          
          if (isAvailable) {
            availableTimes.push(new Date(checkTime));
            if (availableTimes.length >= 3) break; // Suggest up to 3 alternatives
            
            // Move to next slot (30 min increments)
            checkTime.setMinutes(checkTime.getMinutes() + 30);
          } else {
            // If we didn't break out of the loop, increment by 30 minutes
            if (isAvailable) checkTime.setMinutes(checkTime.getMinutes() + 30);
          }
        }
      }
      
      return { hasOverlap, availableTimes };
    } catch (error) {
      console.error("Error checking for meeting overlaps:", error);
      return { hasOverlap: false, availableTimes: [] };
    }
  };

  // --- Validate Meeting Time ---
  const validateMeetingTime = (proposedTime: Date): { isValid: boolean, message: string } => {
    const now = new Date();
    
    if (proposedTime < now) {
      return { 
        isValid: false, 
        message: `The proposed meeting time (${format(proposedTime, 'h:mm a')}) has already passed. Please choose a future time.` 
      };
    }
    
    return { isValid: true, message: "" };
  };

  // --- Format Suggested Times ---
  const formatSuggestedTimes = (times: Date[]): string => {
    if (times.length === 0) return "No alternative times available today.";
    
    return times.map(time => format(time, 'h:mm a')).join(', ');
  };

  // --- NLP: Parse Meeting Request using Perplexity API ---
  const processNaturalLanguage = async (text: string): Promise<MeetingDetails | null> => {
    try {
      console.log("Processing input with Perplexity API:", text)
      
      const defaultTime = getDefaultMeetingTime();
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PPLX_API_KEY}`
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: `You are a meeting scheduling assistant. Extract the following information from the user's message:
              1. Meeting title (default to "Meeting" if not specified)
              2. Date (default to today if not specified)
              3. Time (default to "${defaultTime}" if not specified)
              4. Duration in minutes (default to 30 if not specified, if user mentions hours, convert to minutes)
              5. Participants (array of names, can be empty)
              
              Pay special attention to duration - if user mentions "2 hour meeting", the duration should be 120 minutes.
              
              Format your response as a valid JSON object with these keys: title, date, time, duration, participants.
              For date, use YYYY-MM-DD format or special values like "today" or "tomorrow".
              For time, use 12-hour format with AM/PM.
              For duration, use minutes as a number.
              For participants, return an array of strings with names.`
            },
            {
              role: 'user',
              content: text
            }
          ]
        })
      });
      
      const data = await response.json();
      console.log("Perplexity API response:", data);
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
        console.error("Unexpected response format from Perplexity API");
        return fallbackProcessNaturalLanguage(text);
      }
      
      try {
        const parsedResponse = JSON.parse(data.choices[0].message.content);
        
        // Convert date string to Date object
        let meetingDate = new Date();
        if (parsedResponse.date) {
          if (parsedResponse.date.toLowerCase() === "tomorrow") {
            meetingDate = addDays(new Date(), 1);
          } else if (parsedResponse.date.toLowerCase() === "today") {
            meetingDate = new Date();
          } else {
            try {
              meetingDate = new Date(parsedResponse.date);
              if (isNaN(meetingDate.getTime())) {
                meetingDate = new Date();
              }
            } catch (e) {
              meetingDate = new Date();
            }
          }
        }
        
        return {
          title: parsedResponse.title || "Meeting",
          date: meetingDate,
          time: parsedResponse.time || defaultTime,
          duration: parsedResponse.duration || 30,
          participants: Array.isArray(parsedResponse.participants) ? parsedResponse.participants : []
        };
      } catch (e) {
        console.error("Error parsing Perplexity API response:", e);
        return fallbackProcessNaturalLanguage(text);
      }
    } catch (error) {
      console.error("Error using Perplexity API:", error);
      return fallbackProcessNaturalLanguage(text);
    }
  }
  
  // Fallback to basic regex parsing if Perplexity API fails
  const fallbackProcessNaturalLanguage = (text: string): MeetingDetails | null => {
    console.log("Using fallback parsing for:", text);
    let meetingDate = new Date();
    if (text.toLowerCase().includes("tomorrow")) {
      meetingDate = addDays(new Date(), 1);
    } else if (text.toLowerCase().includes("today")) {
      meetingDate = new Date();
    } else {
      const datePattern = /on\s+([A-Za-z]+\s+\d+)/i;
      const dateMatch = text.match(datePattern);
      if (dateMatch) {
        const parsedDate = parse(dateMatch[1], "MMMM d", new Date());
        if (isValid(parsedDate)) {
          meetingDate = parsedDate;
        }
      }
    }

    // Use next hour as default time
    let meetingTime = getDefaultMeetingTime();
    const timePattern = /at\s+(\d+(?::\d+)?\s*(?:am|pm)?)/i;
    const timeMatch = text.match(timePattern);
    if (timeMatch) {
      meetingTime = timeMatch[1];
    } else if (text.toLowerCase().includes("5pm") || text.toLowerCase().includes("5 pm")) {
      meetingTime = "5:00 PM";
    }

    // Extract duration with improved pattern matching
    let duration = 30; // Default 30 minutes
    const hourPattern = /(\d+)\s*(?:hour|hr)/i;
    const hourMatch = text.match(hourPattern);
    if (hourMatch) {
      duration = parseInt(hourMatch[1]) * 60; // Convert hours to minutes
    } else {
      const minutePattern = /for\s+(\d+)\s*(?:min|minute|minutes)/i;
      const minuteMatch = text.match(minutePattern);
      if (minuteMatch) {
        duration = parseInt(minuteMatch[1]);
      }
    }

    const participants: string[] = [];
    const withPattern = /with\s+([A-Za-z\s,]+)(?:\s+to|\s+about|\s+at|$)/i;
    const withMatch = text.match(withPattern);
    if (withMatch) {
      const participantsText = withMatch[1];
      const participantsList = participantsText
        .split(/,|\sand\s/)
        .map(p => p.trim())
        .filter(p => p.length > 0);
      participants.push(...participantsList);
    }

    let title = "Meeting";
    if (text.toLowerCase().includes("about") || text.toLowerCase().includes("to discuss")) {
      const purposePattern = /(?:about|to discuss)\s+([^,\.]+)/i;
      const purposeMatch = text.match(purposePattern);
      if (purposeMatch) {
        title = `Meeting about ${purposeMatch[1].trim()}`;
      }
    } else if (participants.length > 0) {
      title = `Meeting with ${participants.join(", ")}`;
    }

    console.log("Parsed meeting details:", { title, meetingDate, meetingTime, duration, participants });
    return {
      title,
      date: meetingDate,
      time: meetingTime,
      duration,
      participants
    };
  }

  // --- Contact Resolution ---
  const resolveContactEmail = async (name: string): Promise<string | null> => {
    try {
      const { gapi } = await import('gapi-script');
      const authInstance = await getAuthInstance();
      if (authInstance && !authInstance.isSignedIn.get()) {
        console.log(`User not signed in, requesting sign-in for contact lookup: ${name}`);
        await authInstance.signIn();
        console.log("Sign-in completed for contact lookup");
      }
      console.log("Searching contacts for:", name);
      
      // Check if People API is available
      if (!gapi.client.people) {
        console.error("People API not available for contact lookup");
        return null;
      }
      
      // First, send a "warmup" request as recommended in the documentation
      try {
        await gapi.client.people.people.searchContacts({
          query: '',
          readMask: 'names,emailAddresses'
        });
        console.log("Warmup search request sent");
        
        // Wait a few seconds as recommended
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (warmupErr) {
        console.warn("Warmup search request failed, continuing anyway:", warmupErr);
      }
      
      const response = await gapi.client.people.people.searchContacts({
        query: name,
        readMask: 'names,emailAddresses'
      });
      console.log("Contact search response:", response);
      const results = response.result.results || [];
      if (results.length > 0 && results[0].person?.emailAddresses?.length > 0) {
        const foundEmail = results[0].person.emailAddresses[0].value || null;
        console.log(`Found email for ${name}: ${foundEmail}`);
        return foundEmail;
      }
      console.log(`No contact found for ${name}`);
      return null;
    } catch (error) {
      console.error("Error resolving contact:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
      return null;
    }
  }

  // --- Meeting Scheduling ---
  const createMeeting = async (details: MeetingDetails): Promise<MeetingDetails | null> => {
    try {
      const { gapi } = await import('gapi-script');
      const authInstance = await getAuthInstance();
      if (authInstance && !authInstance.isSignedIn.get()) {
        console.log("Signing in user for calendar event...");
        await authInstance.signIn();
        console.log("Sign-in completed for calendar event");
      }
      
      // Parse time and create date objects
      const timeComponents = details.time.match(/(\d+)(?::(\d+))?\s*(am|pm)?/i);
      let hours = parseInt(timeComponents?.[1] || "9");
      const minutes = parseInt(timeComponents?.[2] || "0");
      const period = timeComponents?.[3]?.toLowerCase();
      if (period === 'pm' && hours < 12) hours += 12;
      else if (period === 'am' && hours === 12) hours = 0;
      
      const startDateTime = new Date(details.date);
      startDateTime.setHours(hours, minutes, 0, 0);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + (details.duration || 30));
      
      // Validate meeting time
      const timeValidation = validateMeetingTime(startDateTime);
      if (!timeValidation.isValid && !forceSchedule) {
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: `${timeValidation.message} Would you like to schedule this meeting for tomorrow instead?`
          }
        ]);
        setIsLoading(false);
        return null;
      }
      
      // Check for overlaps if not forcing schedule
      if (!forceSchedule) {
        const { hasOverlap, availableTimes } = await checkForOverlaps(startDateTime, endDateTime);
        
        if (hasOverlap) {
          setPendingMeetingDetails(details);
          
          const suggestedTimes = formatSuggestedTimes(availableTimes);
          setMessages(prev => [
            ...prev,
            {
              role: "assistant",
              content: `There's already a meeting scheduled at ${format(startDateTime, 'h:mm a')}. Here are some available times today: ${suggestedTimes}. Would you like to reschedule, or proceed with the original time anyway?`
            }
          ]);
          setIsLoading(false);
          return null;
        }
      }
      
      console.log("Resolving attendee emails...");

      // If emails already exist on details (user provided), use them
      let emails = details.emails;
      let missingEmailIndex = -1;

      if (!emails) {
        console.log("No emails provided, looking up contacts for:", details.participants);
        emails = await Promise.all(
          details.participants.map(async (name) => await resolveContactEmail(name))
        );
        console.log("Email lookup results:", emails);
        missingEmailIndex = emails.findIndex(email => !email);
      }

      // If any email is missing, prompt the user
      if (missingEmailIndex !== -1) {
        const missingName = details.participants[missingEmailIndex];
        console.log(`Missing email for participant: ${missingName}`);
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: `I couldn't find an email address for "${missingName}". Please enter their email address to continue:`
          }
        ]);
        setCurrentMeeting({
          ...details,
          emails,
          missingEmailIndex
        });
        setIsLoading(false);
        return null; // Early exit
      }

      // Log each email being invited
      emails.forEach((email, idx) => {
        console.log(`Sending invite to: ${email} (Name: ${details.participants[idx]})`);
      });

      // Build attendees array for Google API
      const resolvedAttendees = details.participants.map((name, idx) => ({
        email: emails![idx]!,
        displayName: name
      }));
      console.log("Resolved attendees:", resolvedAttendees);

      console.log("Creating calendar event:", { startDateTime, endDateTime });

      const event = {
        summary: details.title,
        description: 'Meeting scheduled via MeetMate',
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        conferenceData: {
          createRequest: {
            requestId: `meetmate-${Date.now()}`
          }
        },
        attendees: resolvedAttendees
      };
      
      console.log("Calendar event payload:", JSON.stringify(event, null, 2));
      
      const response = await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all' // Explicitly request to send invites
      });
      
      interface CalendarAttendee {
        email: string;
        responseStatus: string;
      }
      
      // Then use it in your map function
      console.log("Checking if emails were sent:", response.result.attendees?.map((a: CalendarAttendee) => `${a.email}: ${a.responseStatus}`));
      
      // Reset force schedule flag
      setForceSchedule(false);
      
      return {
        ...details,
        emails,
        meetingLink: response.result.hangoutLink || `https://meet.google.com/${Math.random().toString(36).substring(2, 10)}`
      };
    } catch (error) {
      console.error("Error creating meeting:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
      
      // Reset force schedule flag
      setForceSchedule(false);
      
      // Check if there are missing participants
      if (details.participants.length > 0) {
        // Try to identify which participant is causing the issue
        const missingParticipant = details.participants[0]; // Just use the first one for simplicity
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: `I couldn't find an email address for "${missingParticipant}". Please enter their email address to continue:`
          }
        ]);
        
        // Set current meeting with a fake missingEmailIndex to trigger the email collection flow
        setCurrentMeeting({
          ...details,
          emails: details.emails || Array(details.participants.length).fill(null),
          missingEmailIndex: 0
        });
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: "I encountered an error while scheduling the meeting. Please try again later."
          }
        ]);
      }
      
      return null;
    }
  }

  // --- Document Request (Mock) ---
  const sendDocumentRequests = async (meeting: MeetingDetails): Promise<void> => {
    try {
      console.log("Sending document requests to:", meeting.emails);
      setScheduledMeetings(prev =>
        prev.map(m =>
          m.title === meeting.title && m.date === meeting.date
            ? { ...m, documentRequestSent: true }
            : m
        )
      );
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `I've sent emails to all participants requesting any documents they'd like to share for the meeting. These will be collected in the "Meeting Files" section before the meeting.`
        }
      ]);
    } catch (error) {
      console.error("Error sending document requests:", error);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `I encountered an error while sending document request emails. Please try again later.`
        }
      ]);
    }
  }

  // --- Conversation Handler ---
  const handleConversation = async (userInput: string): Promise<string> => {
    try {
      // Check for greetings
      const greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"];
      if (greetings.some(greeting => userInput.toLowerCase().includes(greeting))) {
        return "Hello! How can I help you schedule meetings today?";
      }
      
      // Check for thanks
      if (userInput.toLowerCase().includes("thank") || userInput.toLowerCase().includes("thanks")) {
        return "You're welcome! Is there anything else you need help with?";
      }
      
      // Check for goodbye
      if (userInput.toLowerCase().includes("bye") || userInput.toLowerCase().includes("goodbye")) {
        return "Goodbye! Feel free to come back when you need to schedule another meeting.";
      }
      
      // Handle general questions about capabilities
      if (userInput.toLowerCase().includes("what can you do") || userInput.toLowerCase().includes("help me")) {
        return "I can help you schedule meetings by understanding natural language requests. Just tell me who you want to meet with, when, and for how long. I'll create a Google Meet link and send calendar invites to all participants. I can also save new contacts for future meetings.";
      }
      
      // For other inputs that don't match meeting patterns
      if (!userInput.toLowerCase().includes("meet") && 
          !userInput.toLowerCase().includes("schedule") && 
          !userInput.toLowerCase().includes("appointment") &&
          !userInput.toLowerCase().includes("call") &&
          !userInput.toLowerCase().includes("with")) {
        return "I'm your meeting scheduling assistant. I can help you set up meetings with Google Meet. Please let me know who you'd like to meet with and when.";
      }
      
      // Default response for unrecognized inputs
      return "I'm not sure I understand. Could you please provide details about when you'd like to schedule a meeting and with whom?";
    } catch (error) {
      console.error("Error in conversation handler:", error);
      return "I'm having trouble processing your request. Could you try again with details about when and with whom you'd like to meet?";
    }
  }

  // --- Handle Participant Selection ---
  const handleParticipantSelect = (participants: Contact[]) => {
    console.log("Selected participants:", participants);
    setSelectedParticipants(participants);
    
    // If we have pending meeting details, update them with the selected participants
    if (pendingMeetingDetails) {
      const updatedMeetingDetails = {
        ...pendingMeetingDetails,
        participants: participants.map(p => p.name),
        emails: participants.map(p => p.email)
      };
      
      setPendingMeetingDetails(null);
      
      // Create the meeting with the selected participants
      handleCreateMeetingWithParticipants(updatedMeetingDetails);
    } else {
      // Just update the UI to show selected participants
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `I've added ${participants.map(p => p.name).join(", ")} to your meeting. Now, please tell me when you'd like to schedule this meeting.`
        }
      ]);
    }
  }
  
  // --- Create Meeting with Selected Participants ---
  const handleCreateMeetingWithParticipants = async (meetingDetails: MeetingDetails) => {
    setIsLoading(true);
    console.log("Creating meeting with selected participants:", meetingDetails);
    
    const createdMeeting = await createMeeting(meetingDetails);
    if (createdMeeting) {
      console.log("Meeting created successfully:", createdMeeting);
      setScheduledMeetings(prev => [...prev, createdMeeting]);
      setCurrentMeeting(createdMeeting);
      const formattedDate = format(createdMeeting.date, "EEEE, MMMM d, yyyy");
      const response = `✓ I've scheduled your meeting "${createdMeeting.title}" for ${formattedDate} at ${createdMeeting.time}.\n\n` +
        `Meeting link: ${createdMeeting.meetingLink}\n\n` +
        `Calendar invites have been sent to ${createdMeeting.participants.join(", ")}.\n\n` +
        `Would you like me to send document request emails to all participants?`;
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } else {
      console.log("Failed to create meeting");
      // Error message is handled in createMeeting function
    }
    setIsLoading(false);
  }

  // --- Handle New Contact Request ---
  const handleNewContactRequest = (name: string) => {
    setNewContactName(name);
    setMessages(prev => [
      ...prev,
      {
        role: "assistant",
        content: `I couldn't find "${name}" in your contacts. Please provide an email address for ${name}:`
      }
    ]);
  }

  // --- Form Submission Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: input }]);
    setIsLoading(true);
    setInput("");

    try {
      // Handle response to overlap suggestion or time validation issue
      if (pendingMeetingDetails && 
          (input.toLowerCase().includes("proceed") || 
           input.toLowerCase().includes("original") || 
           input.toLowerCase().includes("anyway") ||
           input.toLowerCase().includes("yes"))) {
        
        console.log("User wants to proceed with original time despite overlap/validation issue");
        setForceSchedule(true);
        const details = pendingMeetingDetails;
        setPendingMeetingDetails(null);
        
        const createdMeeting = await createMeeting(details);
        if (createdMeeting) {
          console.log("Meeting created successfully despite issues:", createdMeeting);
          setScheduledMeetings(prev => [...prev, createdMeeting]);
          setCurrentMeeting(createdMeeting);
          const formattedDate = format(createdMeeting.date, "EEEE, MMMM d, yyyy");
          const response = `✓ I've scheduled your meeting "${createdMeeting.title}" for ${formattedDate} at ${createdMeeting.time}.\n\n` +
            `Meeting link: ${createdMeeting.meetingLink}\n\n` +
            `Calendar invites have been sent to ${createdMeeting.participants.join(", ")}.\n\n` +
            `Would you like me to send document request emails to all participants?`;
          setMessages(prev => [...prev, { role: "assistant", content: response }]);
        }
        setIsLoading(false);
        return;
      }
      
      // Handle rescheduling to suggested time
      if (pendingMeetingDetails && 
          (input.toLowerCase().includes("reschedule") || 
           input.toLowerCase().includes("different time"))) {
        
        const timePattern = /(\d+(?::\d+)?\s*(?:am|pm))/i;
        const timeMatch = input.match(timePattern);
        
        if (timeMatch) {
          const newTime = timeMatch[1];
          const updatedMeeting = {
            ...pendingMeetingDetails,
            time: newTime
          };
          
          setPendingMeetingDetails(null);
          console.log("Rescheduling meeting to:", newTime);
          const createdMeeting = await createMeeting(updatedMeeting);
          if (createdMeeting) {
            console.log("Meeting rescheduled successfully:", createdMeeting);
            setScheduledMeetings(prev => [...prev, createdMeeting]);
            setCurrentMeeting(createdMeeting);
            const formattedDate = format(createdMeeting.date, "EEEE, MMMM d, yyyy");
            const response = `✓ I've rescheduled your meeting "${createdMeeting.title}" for ${formattedDate} at ${createdMeeting.time}.\n\n` +
              `Meeting link: ${createdMeeting.meetingLink}\n\n` +
              `Calendar invites have been sent to ${createdMeeting.participants.join(", ")}.\n\n` +
              `Would you like me to send document request emails to all participants?`;
            setMessages(prev => [...prev, { role: "assistant", content: response }]);
          }
          setIsLoading(false);
          return;
        } else {
          setMessages(prev => [
            ...prev,
            {
              role: "assistant",
              content: "Please specify a time for rescheduling, for example: 'Reschedule to 3:30 PM'"
            }
          ]);
          setIsLoading(false);
          return;
        }
      }

      // If we're waiting for a new contact email
      if (newContactName) {
        const emailInput = input.trim();
        
        // Validate email format
        if (!/\S+@\S+\.\S+/.test(emailInput)) {
          console.log("Invalid email format:", emailInput);
          setMessages(prev => [
            ...prev,
            {
              role: "assistant",
              content: `That doesn't look like a valid email. Please enter a valid email address for ${newContactName}:`
            }
          ]);
          setIsLoading(false);
          return;
        }
        
        // Create contact in Google Contacts
        console.log(`Attempting to create contact for ${newContactName} with email ${emailInput}`);
        const contactCreated = await createGoogleContact(newContactName, emailInput);
        
        if (contactCreated) {
          console.log(`Successfully created contact for ${newContactName}`);
          
          // Wait for a few seconds to allow the contact to propagate
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          setMessages(prev => [
            ...prev,
            {
              role: "assistant",
              content: `I've added ${newContactName} (${emailInput}) to your contacts for future meetings. Would you like to schedule a meeting with them now?`
            }
          ]);
          
          // Add to selected participants
          const newContact: Contact = {
            id: `new-${Date.now()}`,
            name: newContactName,
            email: emailInput
          };
          setSelectedParticipants(prev => [...prev, newContact]);
        } else {
          console.log(`Failed to create contact for ${newContactName}`);
          setMessages(prev => [
            ...prev,
            {
              role: "assistant",
              content: `I couldn't add ${newContactName} to your contacts. Would you like to try again?`
            }
          ]);
        }
        
        setNewContactName(null);
        setIsLoading(false);
        return;
      }

      // If we're waiting for a missing email, use this input as the email for the missing participant
      if (
        currentMeeting &&
        typeof currentMeeting.missingEmailIndex === "number" &&
        currentMeeting.missingEmailIndex !== -1
      ) {
        const emails = currentMeeting.emails ? [...currentMeeting.emails] : [];
        const emailInput = input.trim();
        const missingIndex = currentMeeting.missingEmailIndex;
        const participantName = currentMeeting.participants[missingIndex];
        
        console.log(`Received email input for ${participantName}: ${emailInput}`);
        
        // Validate email format
        if (!/\S+@\S+\.\S+/.test(emailInput)) {
          console.log("Invalid email format:", emailInput);
          setMessages(prev => [
            ...prev,
            {
              role: "assistant",
              content: `That doesn't look like a valid email. Please enter a valid email address for ${participantName}:`
            }
          ]);
          setIsLoading(false);
          return;
        }
        
        // Save the email
        emails[missingIndex] = emailInput;
        
        // Create contact in Google Contacts
        console.log(`Attempting to create contact for ${participantName} with email ${emailInput}`);
        const contactCreated = await createGoogleContact(participantName, emailInput);
        
        if (contactCreated) {
          console.log(`Successfully created contact for ${participantName}`);
          
          // Wait for a few seconds to allow the contact to propagate
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          setMessages(prev => [
            ...prev,
            {
              role: "assistant",
              content: `I've added ${participantName} (${emailInput}) to your contacts for future meetings.`
            }
          ]);
        } else {
          console.log(`Failed to create contact for ${participantName}`);
          setMessages(prev => [
            ...prev,
            {
              role: "assistant",
              content: `I couldn't add ${participantName} to your contacts, but I'll use the email address you provided for this meeting.`
            }
          ]);
        }
        
        // Try to create the meeting again with the provided email
        const meetingWithEmail: MeetingDetails = {
          ...currentMeeting,
          emails,
          missingEmailIndex: -1
        };
        setCurrentMeeting(meetingWithEmail);
        console.log("Attempting to create meeting with provided email:", meetingWithEmail);
        const createdMeeting = await createMeeting(meetingWithEmail);
        if (createdMeeting) {
          console.log("Meeting created successfully with provided email");
          setScheduledMeetings(prev => [...prev, createdMeeting]);
          setCurrentMeeting(null);
          const formattedDate = format(createdMeeting.date, "EEEE, MMMM d, yyyy");
          const response = `✓ I've scheduled your meeting "${createdMeeting.title}" for ${formattedDate} at ${createdMeeting.time}.\n\n` +
            `Meeting link: ${createdMeeting.meetingLink}\n\n` +
            `Calendar invites have been sent to ${createdMeeting.participants.join(", ")}.\n\n` +
            `Would you like me to send document request emails to all participants?`;
          setMessages(prev => [...prev, { role: "assistant", content: response }]);
        } else {
          console.log("Failed to create meeting with provided email");
          setMessages(prev => [
            ...prev,
            {
              role: "assistant",
              content: `I couldn't find an email address for one of the participants. Please try again with different participants.`
            }
          ]);
        }
        setIsLoading(false);
        setInput("");
        return;
      }

      // Document request follow-up
      if (currentMeeting &&
        (input.toLowerCase().includes("yes") ||
          input.toLowerCase().includes("document") ||
          input.toLowerCase().includes("send"))) {
        console.log("Processing document request for meeting:", currentMeeting);
        await sendDocumentRequests(currentMeeting);
        setCurrentMeeting(null);
        setIsLoading(false);
        return;
      }
      
      // Check if this is a meeting request
      const isMeetingRequest = input.toLowerCase().includes("meet") || 
                              input.toLowerCase().includes("schedule") || 
                              input.toLowerCase().includes("appointment") ||
                              (input.toLowerCase().includes("with") && input.toLowerCase().includes("at"));
      
      if (isMeetingRequest) {
        // Normal flow: parse and create meeting
        console.log("Processing natural language input:", input);
        const meetingDetails = await processNaturalLanguage(input);
        if (meetingDetails) {
          // If we have selected participants from the selector and the parsed meeting doesn't have participants
          if (selectedParticipants.length > 0 && meetingDetails.participants.length === 0) {
            console.log("Using selected participants for meeting:", selectedParticipants);
            meetingDetails.participants = selectedParticipants.map(p => p.name);
            meetingDetails.emails = selectedParticipants.map(p => p.email);
          }
          
          console.log("About to create meeting with details:", meetingDetails);
          const createdMeeting = await createMeeting(meetingDetails);
          if (createdMeeting) {
            console.log("Meeting created successfully:", createdMeeting);
            setScheduledMeetings(prev => [...prev, createdMeeting]);
            setCurrentMeeting(createdMeeting);
            const formattedDate = format(createdMeeting.date, "EEEE, MMMM d, yyyy");
            const response = `✓ I've scheduled your meeting "${createdMeeting.title}" for ${formattedDate} at ${createdMeeting.time}.\n\n` +
              `Meeting link: ${createdMeeting.meetingLink}\n\n` +
              `Calendar invites have been sent to ${createdMeeting.participants.join(", ")}.\n\n` +
              `Would you like me to send document request emails to all participants?`;
            setMessages(prev => [...prev, { role: "assistant", content: response }]);
            setSelectedParticipants([]);
          } else {
            // Error message is handled in createMeeting function
            console.log("Failed to create meeting");
          }
        } else {
          console.log("Insufficient meeting details, asking for more information");
          setMessages(prev => [...prev, {
            role: "assistant",
            content: "I'd be happy to schedule that meeting for you. Could you provide more details about when you'd like to schedule it and who should attend?"
          }]);
        }
      } else {
        // Handle conversation
        const response = await handleConversation(input);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: response
        }]);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I encountered an error while processing your request. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <Card className="flex h-[500px] flex-col">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="flex items-center text-lg font-medium">
            <Calendar className="mr-2 h-5 w-5 text-primary" />
            AI Meeting Scheduler
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                >
                  {message.content.split("\n").map((line, i) => (
                    <p key={i} className={i > 0 ? "mt-2" : ""}>
                      {line.includes("Meeting link:") ? (
                        <span className="flex items-center">
                          <LinkIcon className="mr-1 h-4 w-4" />
                          <a href={line.replace("Meeting link: ", "")} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline hover:text-blue-700">
                            {line.replace("Meeting link: ", "")}
                          </a>
                        </span>
                      ) : (
                        line
                      )}
                    </p>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex max-w-[80%] items-center rounded-lg bg-muted px-4 py-2">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <CardFooter className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              placeholder="Type your meeting request..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="button" 
              size="icon" 
              variant="outline"
              onClick={() => setIsParticipantSelectorOpen(true)}
              disabled={isLoading}
              title="Select participants"
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
      
      <ParticipantSelector
        isOpen={isParticipantSelectorOpen}
        onClose={() => setIsParticipantSelectorOpen(false)}
        onSelectParticipants={handleParticipantSelect}
        initialSelectedParticipants={selectedParticipants}
      />
    </>
  )
}
