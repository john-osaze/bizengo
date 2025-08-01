import { InvoiceGenerator } from "@/components/tools/invoice/InvoiceGenerator"

export default function Invoice() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 sm:py-16 px-2 sm:px-6">
            <InvoiceGenerator />
        </div>
    )
}
