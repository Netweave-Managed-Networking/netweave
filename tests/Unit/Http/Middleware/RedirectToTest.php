<?php

use App\Http\Middleware\RedirectTo;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    Route::middleware(RedirectTo::class)->any('/test', function () {
        return response('Test response');
    });
    Route::middleware(RedirectTo::class)->any('/test-json', function () {
        return new JsonResponse(['name' => 'marvin']);
    });
    Route::middleware(RedirectTo::class)->any('/stream', function () {
        return new StreamedResponse(function () {
            echo 'Streamed response';
        });
    });
});

it('redirects to the specified URL with the same response', function () {
    $response = $this->get('/test?redirect_to=/redirected');

    $response->assertRedirect('/redirected');
    $response->assertSessionHas('status', 200);
    $response->assertSessionHas('content', 'Test response');
});

it('does not redirect if redirect_to is not specified', function () {
    $response = $this->get('/test');

    $response->assertOk();
    $response->assertSee('Test response');
});

it('does not redirect if the response is a file', function () {
    Route::middleware(RedirectTo::class)->any('/file', function () {
        return new BinaryFileResponse(__FILE__);
    });

    $response = $this->get('/file?redirect_to=/redirected');

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/x-php; charset=UTF-8');
});

it('does not redirect if the response is a stream', function () {
    $response = $this->get('/stream?redirect_to=/redirected');

    $response->assertOk();
});

it('does not redirect if the request expects JSON', function () {
    $response = $this->getJson('/test-json?redirect_to=/redirected');

    $response->assertOk();
    $response->assertJson(['name' => 'marvin']);
});

it('does not redirect if the response is not successful', function () {
    Route::middleware(RedirectTo::class)->any('/error', function () {
        return response('Error response', 400);
    });

    $response = $this->get('/error?redirect_to=/redirected');

    $response->assertStatus(400);
    $response->assertSee('Error response');
});

it('does not redirect if the response is a validation error', function () {
    Route::middleware(RedirectTo::class)->any('/validation-error', function () {
        return redirect()->back()->withErrors(['field' => 'Validation error']);
    });

    $response = $this->get('/validation-error?redirect_to=/redirected');

    $response->assertSessionHasErrors(['field']);
});

it('replaces {id} placeholder in redirect_to URL with modelId from session', function () {
    session()->put('modelId', 123);

    $response = $this->get('/test?redirect_to=/redirected/{id}');

    $response->assertRedirect('/redirected/123');
    $response->assertSessionHas('status', 200);
    $response->assertSessionHas('content', 'Test response');
});

it('aborts with 400 if modelId is not found in session', function () {
    $response = $this->get('/test?redirect_to=/redirected/{id}');

    $response->assertStatus(400);
});

it('aborts with 403 if redirect_to URL is not a relative path', function () {
    $response = $this->get('/test?redirect_to=https://example.com');

    $response->assertStatus(403);
    $response->assertSee('Unauthorized redirect');
});
