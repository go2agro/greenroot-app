import { DetailField } from '@/components/DetailField'

export function DetailGrid({ fields }: { fields: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {fields.map((field) => (
        <DetailField key={field.label} label={field.label} value={field.value} />
      ))}
    </div>
  )
}
