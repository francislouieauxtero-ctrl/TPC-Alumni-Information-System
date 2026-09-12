@component('mail::message')
# Welcome, {{ $name }}!

You have successfully registered for the **TPC Alumni Employment and Career Management System**.

@component('mail::panel')
Your Alumni account has been successfully created. You will now receive official **events, announcements, and other important updates** from the TPC Alumni Employment and Career Management System.
@endcomponent

@component('mail::button', ['url' => $loginUrl])
Log In to Your Account
@endcomponent

**Thank you for becoming part of the TPC Alumni community!**

Warm regards,<br>
**TPC Alumni Employment and Career Management System**
@endcomponent
