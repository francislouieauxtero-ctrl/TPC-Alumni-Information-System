@component('mail::message')
# New Event: {{ $title }}

Hi {{ $name }},

An event you might be interested in has been scheduled:

@component('mail::panel')
**{{ $title }}**

{{ $description }}

**When:** {{ \Carbon\Carbon::parse($startDate)->format('M d, Y h:i A') }} - {{ \Carbon\Carbon::parse($endDate)->format('M d, Y h:i A') }}

**Where:** {{ $location }}

*Organized by: {{ $creatorName }}*
@endcomponent

@component('mail::button', ['url' => config('app.url')])
View Event Details
@endcomponent

Thanks,<br>
Mail from TPC Alumni Portal
@endcomponent
