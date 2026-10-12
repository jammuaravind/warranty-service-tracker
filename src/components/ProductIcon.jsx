import { FiMonitor, FiSmartphone, FiHeadphones, FiTv, FiPackage, FiWatch, FiCamera } from 'react-icons/fi';

// The backend has no "category" field, so the icon is guessed from the product name
export default function ProductIcon({ name = '' }) {
  const n = name.toLowerCase();
  if (/laptop|computer|pc|monitor/.test(n)) return <FiMonitor />;
  if (/phone|mobile|tablet/.test(n)) return <FiSmartphone />;
  if (/head|ear|speaker|airpod/.test(n)) return <FiHeadphones />;
  if (/tv|television|fridge|washing|ac\b|cooler/.test(n)) return <FiTv />;
  if (/watch|band/.test(n)) return <FiWatch />;
  if (/camera/.test(n)) return <FiCamera />;
  return <FiPackage />;
}
