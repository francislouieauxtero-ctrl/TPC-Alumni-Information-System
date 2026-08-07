<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountRejectedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(protected User $user, protected ?string $reason = null)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Alumni Account Registration Was Not Approved',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.account-rejected',
            with: [
                'name' => $this->user->name,
                'email' => $this->user->email,
                'reason' => $this->reason,
            ],
        );
    }
}
