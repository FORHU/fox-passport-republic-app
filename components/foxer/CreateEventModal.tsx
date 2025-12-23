import { useCreateEventModal } from "@/hooks/useCreateEventModal";
import { X, Calendar, Clock, MapPin, Users, ChevronDown, Globe } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateEventModal() {
  const { isOpen, onClose } = useCreateEventModal();
  const [eventType, setEventType] = useState<"in-person" | "virtual">("in-person");
  
  const handleCreateEvent = () => {
    // In a real app, we would gather the form data here
    toast.success("Event Uploaded!");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold">Create event</h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar space-y-5">
          
          {/* Host Info */}
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-500"></div>
             <div>
               <p className="text-sm font-semibold">Foxer Host</p>
               <p className="text-xs text-gray-500 dark:text-gray-400">Host - Your profile</p>
             </div>
          </div>

          {/* Event Name */}
          <div className="space-y-1">
             <input 
               type="text" 
               placeholder="Event name" 
               className="w-full bg-transparent text-xl font-medium placeholder:text-gray-400 border-none focus:ring-0 focus:outline-none px-0 text-gray-900 dark:text-white"
             />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-3 flex items-center gap-3 border border-gray-200 dark:border-gray-700">
               <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
               <div>
                 <p className="text-xs text-gray-500 dark:text-gray-400">Start date</p>
                 <p className="text-sm font-semibold">Dec 23, 2025</p>
               </div>
            </div>
            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-3 flex items-center gap-3 border border-gray-200 dark:border-gray-700">
               <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
               <div>
                 <p className="text-xs text-gray-500 dark:text-gray-400">Start time</p>
                 <p className="text-sm font-semibold">3:00 PM</p>
               </div>
            </div>
          </div>
          <button className="text-pink-600 dark:text-pink-400 text-sm font-medium hover:underline">+ End date and time</button>

          {/* Location Type */}
          <div className="space-y-3">
             <div className="relative">
                <select 
                  className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-gray-700 rounded-lg py-3 pl-4 pr-10 appearance-none focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 text-sm"
                  onChange={(e) => setEventType(e.target.value as "in-person" | "virtual")}
                >
                   <option value="in-person">In person</option>
                   <option value="virtual">Virtual</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
             </div>

             {eventType === "in-person" && (
                <div className="bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center gap-3">
                   <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                   <input 
                     type="text" 
                     placeholder="Add location" 
                     className="bg-transparent flex-1 focus:outline-none text-sm placeholder:text-gray-500"
                   />
                </div>
             )}
          </div>



          {/* Description */}
          <textarea 
            placeholder="What are the details?" 
            className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 min-h-[100px] focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 resize-none placeholder:text-gray-500"
          ></textarea>

          {/* --- USER REQUESTED FIELDS --- */}
          
          <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-800">
             <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Event Services</h3>

             {/* DECORATIONS */}
             <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Decorations</label>
                <select className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 px-3 appearance-none focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 text-sm">
                   <option value="">Select decoration preference...</option>
                   <option value="hire">Hire from partners</option>
                   <option value="foxer">Provided by Foxer</option>
                   <option value="none">None / DIY</option>
                </select>
             </div>

             {/* CATERING */}
             <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Food & Catering</label>
                <select className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 px-3 appearance-none focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 text-sm">
                   <option value="">Select food option...</option>
                   <option value="catered">Catered</option>
                   <option value="self">Self Cook / Potluck</option>
                   <option value="hire">Hire Partner</option>
                </select>
             </div>
          </div>

          {/* Additional Options (Collapsible placeholders) */}
          <div className="space-y-1">
             <button className="w-full flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                <div className="flex items-center gap-3">
                   <Users className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                   <span>Add co-hosts</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
             </button>
             <button className="w-full flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                <div className="flex items-center gap-3">
                   <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                   <span>Repeat event</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
             </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-zinc-900">
           <button 
             onClick={handleCreateEvent}
             className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg transition-colors"
           >
              Create event
           </button>
        </div>

      </div>
    </div>
  );
}
