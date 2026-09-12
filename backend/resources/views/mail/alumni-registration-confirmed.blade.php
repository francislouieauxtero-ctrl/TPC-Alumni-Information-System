@component('mail::message')
# Welcome, {{ $name }}!

You have successfully registered for the TPC Alumni Employment and Career Management System.

Your Alumni account has been successfully created. You will now receive official events, announcements, and other important updates from the TPC Alumni Employment and Career Management System.

Thank you for becoming part of the TPC Alumni community!

@component('mail::button', ['url' => $loginUrl])
Log In to Your Account
@endcomponent

Warm regards,<br>
**TPC Alumni Employment and Career Management System**
@endcomponent
