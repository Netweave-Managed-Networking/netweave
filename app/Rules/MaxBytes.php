<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class MaxBytes implements ValidationRule
{
    public int $maxBytes;

    public function __construct(int $maxBytes = 255)
    {
        $this->maxBytes = $maxBytes;
    }

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (strlen($value) > $this->maxBytes) {
            $fail('validation.max_bytes')->translate(['attribute' => __("validation.attributes.$attribute"), 'max' => $this->maxBytes]);
        }
    }
}
