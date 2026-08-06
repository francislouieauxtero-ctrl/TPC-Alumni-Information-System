<?php

namespace Database\Factories;

use App\Models\Graduate;
use Illuminate\Database\Eloquent\Factories\Factory;

class GraduateFactory extends Factory
{
    protected $model = Graduate::class;

    public function definition(): array
    {
        return [
            'department_id' => 1,
            'student_number' => $this->faker->unique()->numerify('####'),
            'name' => $this->faker->name(),
            'batch_year' => (string) $this->faker->year(),
            'block' => $this->faker->randomElement(['A', 'B', 'C']),
        ];
    }
}
