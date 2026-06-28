const riskStyles = {
  Rendah: 'bg-blue-50 text-blue-700 ring-blue-100',
  Sedang: 'bg-yellow-50 text-yellow-700 ring-yellow-100',
  Tinggi: 'bg-red-50 text-red-700 ring-red-100',
};

function RiskBadge({ level }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ring-1 ${riskStyles[level] ?? riskStyles.Rendah}`}>
      Risiko {level}
    </span>
  );
}

export default RiskBadge;
