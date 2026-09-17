<?php

namespace App\Mail;

use App\Models\Event;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EventNotificationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        protected Event $event,
        protected string $creatorName
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Event: ' . $this->event->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.event-notification',
            with: [
                'name' => 'Alumni',
                'title' => $this->event->title,
                'description' => $this->event->description,
                'startDate' => $this->event->start_date,
                'endDate' => $this->event->end_date,
                'location' => $this->event->location,
                'creatorName' => $this->creatorName,
            ],
        );
    }
}
