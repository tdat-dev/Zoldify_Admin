import { Fragment } from 'react';

/**
 * Ghi chú tình trạng và thẻ "Độ bền" người bán khai, chỉ để xem. Admin cần thấy
 * để xử lý khiếu nại "hàng không đúng mô tả": đối chiếu ảnh người mua gửi với
 * những gì người bán đã cam kết (pin bao nhiêu, lỗi gì, kèm gì).
 *
 * Không cho sửa ở đây: đó là lời người bán, admin sửa hộ thì mất chứng cứ. Form
 * admin không gửi `condition_details`, backend hiểu là giữ nguyên.
 */
interface ConditionDetails {
  battery_health?: number;
  used_months?: number;
  warranty_months?: number;
  defects?: string[];
  accessories?: string[];
  repaired?: boolean;
  repair_note?: string;
}

export default function ConditionDetailsView({
  note,
  details,
}: {
  note?: string | null;
  details?: ConditionDetails | null;
}) {
  const rows: [string, string][] = [];
  if (details?.battery_health !== undefined) rows.push(['Pin còn', `${details.battery_health}%`]);
  if (details?.used_months !== undefined) {
    rows.push(['Đã dùng', details.used_months === 0 ? 'Chưa dùng' : `${details.used_months} tháng`]);
  }
  if (details?.warranty_months !== undefined) {
    rows.push([
      'Bảo hành',
      details.warranty_months === 0 ? 'Hết bảo hành' : `Còn ${details.warranty_months} tháng`,
    ]);
  }
  if (details?.defects?.length) rows.push(['Khuyết điểm', details.defects.join('; ')]);
  if (details?.accessories?.length) rows.push(['Phụ kiện', details.accessories.join(', ')]);
  if (details?.repaired !== undefined) {
    rows.push(['Sửa chữa', details.repaired ? details.repair_note || 'Đã sửa' : 'Chưa sửa']);
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm font-medium text-gray-700">Người bán khai về tình trạng</p>
      {note ? (
        <p className="mt-2 whitespace-pre-line text-sm text-gray-900">{note}</p>
      ) : (
        <p className="mt-2 text-sm text-gray-600">Chưa có ghi chú tình trạng.</p>
      )}
      {rows.length > 0 ? (
        <dl className="mt-3 grid grid-cols-[8rem_1fr] gap-x-3 gap-y-1.5 text-sm">
          {rows.map(([k, v]) => (
            <Fragment key={k}>
              <dt className="text-gray-600">{k}</dt>
              <dd className="text-gray-900">{v}</dd>
            </Fragment>
          ))}
        </dl>
      ) : (
        <p className="mt-1 text-sm text-gray-600">Chưa khai độ bền.</p>
      )}
    </div>
  );
}
