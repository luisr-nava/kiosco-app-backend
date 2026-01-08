export default function EmptyTable({
  title,
  colSpan,
}: {
  title: string;
  colSpan: number;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="text-muted-foreground py-8 text-center text-sm"
      >
        {title}
      </td>
    </tr>
  );
}
