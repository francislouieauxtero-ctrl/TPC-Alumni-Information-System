<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStudentIsVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized',
                'data' => (object) [],
            ], 401);
        }

        if ($request->user()->isStudent() && !$request->user()->is_verified) {
            return response()->json([
                'status' => false,
                'message' => 'Account is unverified',
                'data' => (object) [],
            ], 403);
        }

        return $next($request);
    }
}
