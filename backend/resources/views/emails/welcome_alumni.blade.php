Dear {{ $user->name }},

You have successfully logged in to the TPC Alumni Information and Career Management System.

Your account is now active, and you can access your alumni profile, career information, announcements, events, and other available services.

Thank you for being part of the TPC Alumni Community.

Login Details:
Date & Time: {{ now()->format('Y-m-d H:i:s') }}
Account Email: {{ $user->email }}

If you did not perform this login, please secure your account and contact the system administrator immediately.

Best regards,
TPC Alumni Information and Career Management System
Talibon Polytechnic College
