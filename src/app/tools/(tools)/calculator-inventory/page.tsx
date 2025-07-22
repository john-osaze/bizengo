import { BulkCalculator } from "@/components/tools/calculator/BulkCalculator"

export default function Invoice() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 sm:py-16 px-2 sm:px-6">
            <BulkCalculator />
        </div>
    )
}