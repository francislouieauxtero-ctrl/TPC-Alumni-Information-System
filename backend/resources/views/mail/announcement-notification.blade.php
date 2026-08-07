@component('mail::message')
# New Announcement: {{ $title }}

Hi {{ $name }},

A new announcement has been posted for you:

@component('mail::panel')
**{{ $title }}**

{{ $content }}

*Posted by: {{ $creatorName }}*
@endcomponent

@component('mail::button', ['url' => config('app.url')])
View in Portal
@endcomponent

Thanks,<br>
Mail from TPC Alumni Portal
@endcomponent
