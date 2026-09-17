<?php

namespace App\Mail;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AnnouncementNotificationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        protected Announcement $announcement,
        protected string $creatorName
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Announcement: ' . $this->announcement->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.announcement-notification',
            with: [
                'name' => 'Alumni',
                'title' => $this->announcement->title,
                'content' => $this->announcement->content,
                'creatorName' => $this->creatorName,
            ],
        );
    }
}
