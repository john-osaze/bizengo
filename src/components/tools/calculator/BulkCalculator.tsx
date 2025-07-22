import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalculatorComponent from "./calculator";
import InventoryComponent from "./inventory";

export const BulkCalculator = () => {
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Smart Business Manager</h1>
                <p className="text-muted-foreground">AI-powered bulk calculator with intelligent inventory management</p>
            </div>

            <Tabs defaultValue="inventory" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="inventory">📦 Inventory Manager</TabsTrigger>
                    <TabsTrigger value="calculator">Bulk Calculator</TabsTrigger>
                </TabsList>

                <TabsContent value="calculator" className="space-y-6">
                    <CalculatorComponent />
                </TabsContent>

                <TabsContent value="inventory" className="space-y-6">
                    <InventoryComponent />
                </TabsContent>
            </Tabs>
        </div>
    );
};
