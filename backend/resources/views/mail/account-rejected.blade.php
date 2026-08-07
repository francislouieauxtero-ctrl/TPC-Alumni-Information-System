@component('mail::message')
# Registration Update

Hi {{ $name }},

Your alumni account registration was not approved at this time.

@if($reason)
Reason: {{ $reason }}
@endif

If you believe this was a mistake, please contact the administration office for assistance.

Thanks,<br>
Mail from TPC Alumni Portal
@endcomponent
