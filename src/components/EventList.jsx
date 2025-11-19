import React from 'react';
import EventItem from "./EventItem";

function EventList({ events, onEventSelect }) {
  if (!events || events.length === 0) {
    return <div className="text-center text-white mt-5">Etkinlik bulunamadı.</div>;
  }

  return (
    <div className="row g-4 justify-content-center">
      {events.map((event) => (
        <EventItem 
            key={event.id} 
            event={event} 
            onSelect={onEventSelect} 
        />
      ))}
    </div>
  );
}

export default EventList;