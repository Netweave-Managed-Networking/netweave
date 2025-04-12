<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * this class allows the frontend to specify a redirect target for any request
 * When the frontend adds a query parameter with a redirect path, a redirect will be tried
 * e.g. redirect_to:/organizations/13/resources/create will redirect to that url
 *
 * the frontend even has the possibility to redirect to a page of a modal that was only just created.
 * when the frontend makes a redirect to string with "{id}" in it.
 * In that case the middleware will replace the "{id}" with the id of the model that was just created
 * when the controller does its task: add modelId to the session.
 * e.g. redirect_to:/organizations/{id}/resources/create/ will redirect to the just created organization
 */
class RedirectTo
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response|BinaryFileResponse|StreamedResponse
    {
        $response = $next($request);
        $redirectTo = $request->query('redirect_to');

        if (
            (! $redirectTo)
            || $this->isFile($response)
            || $this->isStream($response)
            || $this->isJson($request)
            || $this->isNotSuccessful($response)
            || $this->validationFailed($response)) {
            return $response;
        }

        if (! str_starts_with($redirectTo, '/')) {
            abort(403, 'Unauthorized redirect');
        }

        return $this->redirectTo($response, $redirectTo);
    }

    private function redirectTo($response, string $redirectTo)
    {
        // Replace {id} placeholder with the actual value from the session
        if (str_contains($redirectTo, '{id}')) {
            $modelId = session()->get('modelId');
            if ($modelId) {
                $redirectTo = str_replace('{id}', $modelId, $redirectTo);
            } else {
                abort(400, 'Model ID not found in session');
            }
        }

        return redirect($redirectTo)->with([
            'status' => $response->status(),
            'headers' => $response->headers->all(),
            'content' => $response->getContent(),
        ]);
    }

    private function isFile(Response $response): bool
    {
        return $response instanceof BinaryFileResponse;
    }

    private function isStream(Response $response): bool
    {
        return $response instanceof StreamedResponse;
    }

    private function isJson(Request $request): bool
    {
        return $request->expectsJson();
    }

    private function isNotSuccessful(Response $response): bool
    {
        return ! $response->isSuccessful() && ! $response->isRedirection();
    }

    private function validationFailed(Response $response): bool
    {
        return isset($response->exception);
    }
}
