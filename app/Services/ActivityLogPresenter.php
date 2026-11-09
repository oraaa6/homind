<?php

namespace App\Services;

use App\Models\ActivityLog;

class ActivityLogPresenter
{
    /** @return array{id: string, title: string, description: string|null, date: string, author: string, type: string} */
    public function forPlace(ActivityLog $log): array
    {
        [$title, $description, $type] = $this->present($log);

        return [
            'id' => (string) $log->id,
            'title' => $title,
            'description' => $description,
            'date' => $log->created_at?->toIso8601String() ?? '',
            'author' => $log->user?->name ?? 'Nieznany użytkownik',
            'type' => $type,
        ];
    }

    /** @return array{id: string, title: string, description: string|null, date: string, author: string, type: string} */
    public function forThing(ActivityLog $log): array
    {
        $details = $log->details ?? [];

        [$title, $description] = match ($log->event) {
            'thing_added' => [
                'Dodano przedmiot do '.$this->placeLabel(
                    $details['place_kind'] ?? null,
                    $details['place_name'] ?? null,
                ),
                $this->quantity($details['quantity'] ?? null, $details['unit'] ?? null),
            ],
            'thing_moved' => [
                'Przeniesiono przedmiot do '.$this->placeLabel(
                    $details['to_place_kind'] ?? null,
                    $details['to_place_name'] ?? null,
                ),
                null,
            ],
            'thing_quantity_changed' => [
                'Zmieniono ilość przedmiotu',
                $this->quantityChange($details),
            ],
            default => $this->thingFallback($log),
        };

        return [
            'id' => (string) $log->id,
            'title' => $title,
            'description' => $description,
            'date' => $log->created_at?->toIso8601String() ?? '',
            'author' => $log->user?->name ?? 'Nieznany użytkownik',
            'type' => match ($log->event) {
                'thing_added' => 'added',
                'thing_moved' => 'moved',
                'thing_deleted' => 'deleted',
                default => 'updated',
            },
        ];
    }

    /** @return array{string, string|null} */
    private function thingFallback(ActivityLog $log): array
    {
        [$title, $description] = $this->present($log);

        return [$title, $description];
    }

    /** @return array{string, string|null, string} */
    private function present(ActivityLog $log): array
    {
        $details = $log->details ?? [];
        $name = $details['thing_name'] ?? $details['place_name'] ?? 'Element';
        $from = $details['from_place_name'] ?? null;
        $to = $details['to_place_name'] ?? null;

        return match ($log->event) {
            'thing_added' => [
                "Przedmiot został dodany: {$name}",
                $this->quantity($details['quantity'] ?? null, $details['unit'] ?? null),
                'added',
            ],
            'thing_moved' => [
                "Przeniesiono przedmiot: {$name}",
                $this->path($from, $to),
                'moved',
            ],
            'thing_quantity_changed' => [
                "Zmieniono ilość: {$name}",
                $this->quantityChange($details),
                'updated',
            ],
            'thing_deleted' => ["Usunięto przedmiot: {$name}", null, 'deleted'],
            'place_created' => ["Dodano lokalizację: {$name}", null, 'created'],
            'place_moved' => [
                "Przeniesiono lokalizację: {$name}",
                $this->path($from, $to),
                'moved',
            ],
            'place_updated' => ["Zaktualizowano lokalizację: {$name}", null, 'updated'],
            'place_code_regenerated' => [
                "Wygenerowano nowy kod: {$name}",
                ($details['old_identifier'] ?? '—').' → '.($details['identifier'] ?? '—'),
                'updated',
            ],
            'place_deleted' => ["Usunięto lokalizację: {$name}", null, 'deleted'],
            default => ['Zarejestrowano aktywność', null, 'updated'],
        };
    }

    private function path(?string $from, ?string $to): ?string
    {
        if ($from === null && $to === null) {
            return null;
        }

        return ($from ?? 'Nieznane miejsce').' → '.($to ?? 'Nieznane miejsce');
    }

    private function quantity(int|string|null $quantity, ?string $unit): ?string
    {
        return $quantity === null ? null : $quantity.' '.($unit ?? '');
    }

    private function placeLabel(?string $kind, ?string $name): string
    {
        $kindLabel = match ($kind) {
            'room' => 'pomieszczenia',
            'rack' => 'regału',
            'box' => 'pudełka',
            default => 'miejsca',
        };

        return $kindLabel.': '.($name ?? 'nieznane');
    }

    /** @param array<string, mixed> $details */
    private function quantityChange(array $details): ?string
    {
        $oldQuantity = $details['old_quantity'] ?? null;
        $newQuantity = $details['new_quantity'] ?? null;

        if ($oldQuantity === null || $newQuantity === null) {
            return null;
        }

        $unit = $details['unit'] ?? '';

        return "{$oldQuantity} {$unit} → {$newQuantity} {$unit}";
    }
}
