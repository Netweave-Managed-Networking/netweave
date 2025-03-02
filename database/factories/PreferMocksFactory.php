<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/** PreferMocksFactories do not just generate random stuff but try to use entries of a given mock list first */
abstract class PreferMocksFactory extends Factory
{
    private array $mockEntriesUsed = [];

    /**
     * * returns an entry from getMockEntry() that does not yet exist in the database.
     * * if all entries exist, generateRandomModel() is returned.
     */
    protected function getUniqueMockOrGenerateNew(string $uniqueField): array
    {
        // Filter out already existing mock entries
        $existingValues = $this->model::pluck($uniqueField)->toArray();
        $mockEntries = $this->getMockEntries();
        $availableMockEntries = array_filter($mockEntries, function ($entry) use ($existingValues, $uniqueField) {
            return ! in_array($entry[$uniqueField], $existingValues) && ! in_array($entry[$uniqueField], $this->mockEntriesUsed);
        });

        if (empty($availableMockEntries)) {
            return $this->generateRandomModel();
        }

        $randomKey = array_rand($availableMockEntries);
        $randomEntry = $availableMockEntries[$randomKey];
        $this->mockEntriesUsed[] = $randomEntry[$uniqueField];

        return $randomEntry;
    }

    abstract protected function generateRandomModel(): array;

    abstract protected function getMockEntries(): array;
}
