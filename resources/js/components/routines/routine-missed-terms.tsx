export default function RoutineMissedTerms({ count }: { count: number }) {
    if (count <= 1) {
        return null;
    }

    const few =
        count % 10 >= 2 &&
        count % 10 <= 4 &&
        (count % 100 < 12 || count % 100 > 14);

    return (
        <span className="block text-xs font-semibold text-foreground">
            {few ? `Minęły ${count} terminy` : `Minęło ${count} terminów`}
        </span>
    );
}
