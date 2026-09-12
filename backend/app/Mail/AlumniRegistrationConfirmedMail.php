<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AlumniRegistrationConfirmedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Registration Confirmed: TPC Alumni Employment and Career Management System',
        );
    }

    public function content(): Content
    {
        $loginUrl = rtrim((string) config('app.frontend_url', 'http://localhost:3000'), '/') . '/login';

        return new Content(
            markdown: 'mail.alumni-registration-confirmed',
            with: [
                'name' => $this->user->name,
                'email' => $this->user->email,
                'loginUrl' => $loginUrl,
            ],
        );
    }
}
