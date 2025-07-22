import React from 'react';
import {
    Document,
    Page,
    View,
    Text,
    StyleSheet,
    pdf,
    Link,
    Image // Import Image component
} from '@react-pdf/renderer';
// Assuming InvoiceItem is imported or defined consistently from InvoiceGenerator.tsx
// It's better to have a dedicated types file, but for this example, aligning with how it's used.
export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number | null;
    unit_price: number | null; // This is the actual unit price
}


export interface InvoiceData {
    businessName: string;
    businessAddress: string;
    businessPhone: string;
    businessLogo: string | null; // Added businessLogo to the interface
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    items: InvoiceItem[];
    discount: number | null;
    tax: number | null;
    total: number;
    invoiceType: "invoice" | "receipt" | "";
    bankName: string;
    accountName: string;
    accountNumber: string;
}

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 25,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        textAlign: 'center',
    },
    // NEW: Style for container holding logo and business name
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center', // Vertically center content
        justifyContent: 'center', // Horizontally center content
        marginBottom: 5,
    },
    // NEW: Style for the logo image
    logo: {
        width: 40, // Adjust size as needed
        height: 40, // Adjust size as needed
        marginRight: 10, // Space between logo and text
        objectFit: 'contain', // Ensures the image fits within the bounds without distortion
    },
    businessName: {
        fontSize: 22,
        fontWeight: 'bold',
        // Removed marginBottom as it's now handled by headerContent
    },
    businessInfo: {
        fontSize: 10,
        marginBottom: 3,
    },
    invoiceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        borderBottomColor: '#808080',
        borderBottomWidth: 1,
        paddingBottom: 5,
    },
    section: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    text: {
        fontSize: 10,
        marginBottom: 2,
    },
    infoLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        marginRight: 4,
    },
    infoPaymentLabel: {
        fontSize: 10,
        fontWeight: 'normal',
        marginRight: 4,
    },
    infoValue: {
        fontSize: 10,
        fontWeight: 'normal',
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#bfbfbf',
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderColor: '#bfbfbf',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#bfbfbf',
    },
    tableEvenRow: {
        backgroundColor: '#f9f9f9',
    },
    tableColHeader: {
        fontSize: 10,
        fontWeight: 'bold',
        padding: 5,
    },
    tableCol: {
        fontSize: 9,
        padding: 5,
    },
    // Updated column widths for 4 columns: Description, Quantity, Unit Price, Total Price
    descriptionColHeader: {
        width: '40%', // Reduced from 50%
        textAlign: 'left',
    },
    descriptionCol: {
        width: '40%', // Reduced from 50%
        textAlign: 'left',
    },
    qtyColHeader: {
        width: '15%', // Adjusted from 20%
        textAlign: 'left',
    },
    qtyCol: {
        width: '15%', // Adjusted from 20%
        textAlign: 'left',
    },
    unitPriceColHeader: { // NEW STYLE
        width: '20%',
        textAlign: 'left',
    },
    unitPriceCol: { // NEW STYLE
        width: '20%',
        textAlign: 'left',
    },
    priceColHeader: {
        width: '25%', // Adjusted from 30% for the total price column
        textAlign: 'right', // Align right for numbers
    },
    priceCol: {
        width: '25%', // Adjusted from 30% for the total price column
        textAlign: 'right', // Align right for numbers
    },
    totalsContainer: {
        flexDirection: 'column',
        alignSelf: 'flex-start', // Adjusted to align left
        width: '50%', // Still occupies half width
        marginTop: 5,
        marginBottom: 10,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 3,
    },
    totalLabel: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 10,
        fontWeight: 'normal',
    },
    grandTotalValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    thankYou: {
        fontSize: 26,
        marginTop: 10,
        marginBottom: 10,
    },
    footer: {
        fontSize: 8,
        color: '#808080',
        marginTop: 'auto',
        textAlign: 'center',
        paddingTop: 10,
        borderTopColor: '#808080',
        borderTopWidth: 0.5,
    },
    link: {
        color: 'blue',
        textDecoration: 'underline',
    }
});

const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return 'N0.00'; // Handle null/undefined/NaN cases
    }
    return `N${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} `;
};

interface InvoiceDocumentProps {
    data: InvoiceData;
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ data }) => (
    <Document>
        <Page size="A5" style={styles.page}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    {data.businessLogo && (
                        <Image src={data.businessLogo} style={styles.logo} />
                    )}
                    <Text style={styles.businessName}>{data.businessName}</Text>
                </View>
                <Text style={styles.businessInfo}>{data.businessAddress}</Text>
                <Text style={styles.businessInfo}>Phone: {data.businessPhone}</Text>
                <Text style={styles.invoiceTitle}>
                    {data.invoiceType === "invoice" ? "Invoice" : "Receipt"}
                </Text>
            </View>

            <View style={styles.section}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Customer:</Text>
                    <Text style={styles.infoValue}>{data.customerName}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Address:</Text>
                    <Text style={styles.infoValue}>{data.customerAddress}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone:</Text>
                    <Text style={styles.infoValue}>{data.customerPhone}</Text>
                </View>
            </View>

            <View style={styles.table}>

                <View style={styles.tableHeaderRow}>
                    <Text style={[styles.tableColHeader, styles.descriptionColHeader]}>Description</Text>
                    <Text style={[styles.tableColHeader, styles.qtyColHeader]}>Quantity</Text>
                    <Text style={[styles.tableColHeader, styles.unitPriceColHeader]}>Unit Price</Text> {/* NEW HEADER */}
                    <Text style={[styles.tableColHeader, styles.priceColHeader]}>Price</Text> {/* This is now line total */}
                </View>

                {data.items.map((item: InvoiceItem, index: number) => (
                    <View
                        style={[
                            styles.tableRow,
                            index % 2 === 1 ? styles.tableEvenRow : {},
                        ]}
                        key={item.id || index.toString()}
                    >
                        <Text style={[styles.tableCol, styles.descriptionCol]}>{item.description}</Text>
                        <Text style={[styles.tableCol, styles.qtyCol]}>{item.quantity}</Text>
                        <Text style={[styles.tableCol, styles.unitPriceCol]}>{formatCurrency(item.unit_price)}</Text> {/* NEW CELL */}
                        <Text style={[styles.tableCol, styles.priceCol]}>{formatCurrency((item.unit_price ?? 0) * (item.quantity ?? 0))}</Text> {/* Calculated line total */}
                    </View>
                ))}
            </View>

            <View style={{ flexDirection: 'column', marginTop: 5 }}>

                <View style={styles.totalsContainer}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal:</Text>
                        <Text style={styles.totalValue}>
                            {formatCurrency(data.items.reduce((acc, item) => acc + ((item.unit_price ?? 0) * (item.quantity ?? 0)), 0))}
                        </Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Discount:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(data.discount ?? 0)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Tax:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(data.tax ?? 0)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total:</Text>
                        <Text style={styles.grandTotalValue}>{formatCurrency(data.total)}</Text>
                    </View>
                </View>

                {data.invoiceType === "invoice" ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Payment Information</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoPaymentLabel}>Bank Name:</Text>
                            <Text style={styles.infoValue}>{data.bankName}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoPaymentLabel}>Account Name:</Text>
                            <Text style={styles.infoValue}>{data.accountName}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoPaymentLabel}>Account Number:</Text>
                            <Text style={styles.infoValue}>{data.accountNumber}</Text>
                        </View>
                    </View>
                ) : (
                    <Text style={styles.thankYou}>Thank you!</Text>
                )}
            </View>


            <View style={styles.footer} fixed>
                <Text>Powered by Roots & Squares</Text>
                <Link src="https://rootsnsquares.com/tools/invoice-generator/">
                    <Text style={styles.link}>https://rootsnsquares.com/tools/invoice-generator/</Text>
                </Link>
            </View>
        </Page>
    </Document>
);

export const generateModernPdf = async (data: InvoiceData): Promise<Blob> => {
    const blob = await pdf(<InvoiceDocument data={data} />).toBlob();
    return blob;
};