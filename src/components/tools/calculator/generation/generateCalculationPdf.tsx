import React from 'react';
import {
    Document,
    Page,
    View,
    Text,
    StyleSheet,
    Image, // <--- Import Image component
    pdf
} from '@react-pdf/renderer';
import { CalculationReportData, ItemCalculationData } from '@/types/calculator'; // Import both interfaces

// Define styles for the PDF document
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica', // Default font
    },
    header: {
        marginBottom: 20,
        textAlign: 'center',
    },
    // <--- NEW STYLES FOR BUSINESS HEADER
    businessHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    businessLogo: {
        width: 40, // Adjust size as needed
        height: 40, // Adjust size as needed
        marginRight: 10, // Space between logo and text
        objectFit: 'contain', // Ensures the image fits within the bounds without distortion
    },
    businessName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
    },
    businessInfo: {
        fontSize: 10,
        marginBottom: 2,
        color: '#666666',
    },
    // END NEW STYLES
    reportTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 8,
        color: '#333333',
    },
    generationDate: {
        fontSize: 14,
        marginBottom: 15,
        color: '#666666',
    },
    separatorLine: {
        borderBottomColor: '#B4B4B4',
        borderBottomWidth: 0.5,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
        color: '#333333',
    },
    subSectionTitle: { // Style for individual item headers
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#555555',
        marginTop: 10,
    },
    keyValuePairRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    keyText: {
        fontSize: 12,
        color: '#333333',
        flexBasis: '70%', // Give key more space
    },
    valueText: {
        fontSize: 12,
        fontWeight: 'normal',
        color: '#333333',
        textAlign: 'right',
        flexBasis: '30%', // Give value specific space
    },
    boldValueText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'right',
        flexBasis: '30%',
    },
    totalLine: {
        borderBottomColor: '#808080',
        borderBottomWidth: 0.5,
        marginTop: 8,
        marginBottom: 8,
    },
    footer: {
        fontSize: 8,
        color: '#808080',
        marginTop: 'auto', // Push footer to the bottom of the page
        textAlign: 'center',
        paddingTop: 10,
    },
    itemContainer: { // Container for each individual item in the report
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomColor: '#EEEEEE',
        borderBottomWidth: 1, // Light separator for items
    },
    lastItemContainer: { // No bottom border for the last item in a list
        marginBottom: 0,
        paddingBottom: 0,
        borderBottomWidth: 0,
    }
});

interface CalculationReportDocumentProps {
    data: CalculationReportData;
}

export const CalculationReportDocument: React.FC<CalculationReportDocumentProps> = ({ data }) => (
    <Document>
        <Page size="A4" style={styles.page}>

            <View style={styles.header} fixed>
                {/* <--- NEW: Conditional rendering of business logo and name */}
                {data.businessName && (
                    <View style={styles.businessHeaderContent}>
                        {data.businessLogo && (
                            <Image src={data.businessLogo} style={styles.businessLogo} />
                        )}
                        <Text style={styles.businessName}>{data.businessName}</Text>
                    </View>
                )}
                {data.businessAddress && (
                    <Text style={styles.businessInfo}>{data.businessAddress}</Text>
                )}
                {data.businessPhone && (
                    <Text style={styles.businessInfo}>Phone: {data.businessPhone}</Text>
                )}
                {/* END NEW */}

                <Text style={styles.reportTitle}>Profit Calculation Report</Text>
                <Text style={styles.generationDate}>Generated On: {data.generationDate}</Text>
                <View style={styles.separatorLine} />
            </View>

            {/* Global Parameters */}
            <Text style={styles.sectionTitle}>Global Parameters</Text>
            <View style={styles.keyValuePairRow}>
                <Text style={styles.keyText}>Desired Profit Margin (Per Item):</Text>
                <Text style={styles.valueText}>{data.profitMarginNum}%</Text>
            </View>
            <View style={styles.keyValuePairRow}>
                <Text style={styles.keyText}>Total Shipping Cost:</Text>
                <Text style={styles.valueText}>N{data.shippingCostNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
            <View style={styles.keyValuePairRow}>
                <Text style={styles.keyText}>Total Other Expenses:</Text>
                <Text style={styles.valueText}>N{data.otherExpensesNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
            <View style={styles.separatorLine} />


            {/* Individual Product Details */}
            <Text style={styles.sectionTitle}>Individual Product Insights</Text>
            {data.items.length === 0 ? (
                <Text style={styles.keyText}>No product details provided.</Text>
            ) : (
                data.items.map((item, index) => (
                    <View key={item.id} style={index === data.items.length - 1 ? styles.lastItemContainer : styles.itemContainer}>
                        <Text style={styles.subSectionTitle}>{item.productCategory || `Product ${index + 1}`}</Text>
                        <View style={styles.keyValuePairRow}>
                            <Text style={styles.keyText}>Cost per Unit:</Text>
                            <Text style={styles.valueText}>N{item.costPerItemNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                        <View style={styles.keyValuePairRow}>
                            <Text style={styles.keyText}>Quantity:</Text>
                            <Text style={styles.valueText}>{item.quantityNum.toLocaleString('en-US')}</Text>
                        </View>
                        <View style={styles.keyValuePairRow}>
                            <Text style={styles.keyText}>Total Purchase Cost (for this item):</Text>
                            <Text style={styles.valueText}>N{item.itemTotalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                        <View style={styles.keyValuePairRow}>
                            <Text style={styles.keyText}>{`Profit for this item (${data.profitMarginNum}%):`}</Text>
                            <Text style={styles.valueText}>N{item.itemProfitAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                        <View style={styles.keyValuePairRow}>
                            <Text style={styles.keyText}>Suggested Selling Price (for this item batch):</Text>
                            <Text style={styles.valueText}>N{item.itemSuggestedSellingPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                        <View style={styles.keyValuePairRow}>
                            <Text style={styles.keyText}>Suggested Price per Unit:</Text>
                            <Text style={styles.valueText}>N{item.pricePerUnit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                    </View>
                ))
            )}
            <View style={styles.separatorLine} />


            {/* Overall Cost Breakdown */}
            <Text style={styles.sectionTitle}>Overall Cost Breakdown</Text>
            <View style={styles.keyValuePairRow}>
                <Text style={styles.keyText}>Total Product Purchase Costs:</Text>
                <Text style={styles.valueText}>N{data.totalItemsBaseCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
            <View style={styles.keyValuePairRow}>
                <Text style={styles.keyText}>Total Shipping/Delivery:</Text>
                <Text style={styles.valueText}>N{data.shippingCostNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
            <View style={styles.keyValuePairRow}>
                <Text style={styles.keyText}>Total Other Expenses:</Text>
                <Text style={styles.valueText}>N{data.otherExpensesNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
            <View style={styles.totalLine} />
            <View style={styles.keyValuePairRow}>
                <Text style={styles.keyText}>Total Expenditure:</Text>
                <Text style={styles.boldValueText}>N{data.totalExpenditure.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>

            {/* Overall Pricing & Profit Analysis */}
            <Text style={styles.sectionTitle}>Overall Pricing & Profit Analysis</Text>
            <View style={styles.keyValuePairRow}>
                <Text style={styles.keyText}>{`Total Profit (from all items, ${data.profitMarginNum}%):`}</Text>
                <Text style={styles.valueText}>N{data.totalItemsProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
            <View style={styles.keyValuePairRow}>
                <Text style={styles.keyText}>Total Revenue Before Global Expenses:</Text>
                <Text style={styles.valueText}>N{data.totalItemsRevenueBeforeGlobalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
            <View style={styles.keyValuePairRow}>
                <Text style={styles.keyText}>Final Suggested Selling Price (Including Expenses):</Text>
                <Text style={styles.boldValueText}>N{data.finalSuggestedSellingPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
            <View style={styles.totalLine} />
            <View style={styles.keyValuePairRow}>
                <Text style={styles.keyText}>Overall Net Profit:</Text>
                <Text style={styles.boldValueText}>N{data.overallNetProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>

            <Text style={styles.footer} fixed>
                Powered by Roots & Squares
            </Text>
        </Page>
    </Document>
);

// This function takes the CalculationReportData and generates the PDF Blob
export const generateCalculationReportPdf = async (data: CalculationReportData): Promise<Blob> => {
    const blob = await pdf(<CalculationReportDocument data={data} />).toBlob();
    return blob;
};