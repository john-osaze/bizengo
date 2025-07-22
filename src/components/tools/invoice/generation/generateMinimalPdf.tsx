import React from 'react';
import {
    Document,
    Page,
    View,
    Text,
    StyleSheet,
    Font,
    pdf,
    Link,
    Image // Import Image component
} from '@react-pdf/renderer';
import { InvoiceData, InvoiceItem } from '@/types/invoice';


const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 25,
        fontFamily: 'Courier',
    },
    header: {
        marginBottom: 2,
        textAlign: 'center',
    },
    // NEW: Container for logo and business name
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    // NEW: Style for the logo image
    logo: {
        width: 30, // Adjust size as needed
        height: 30, // Adjust size as needed
        marginRight: 8, // Space between logo and text
        objectFit: 'contain', // Ensures the image fits within the bounds without distortion
    },
    businessName: {
        fontSize: 16,
        fontWeight: 'bold',
        // marginBottom: 2, // Removed, now handled by headerContent spacing
    },
    businessInfo: {
        fontSize: 8,
        marginBottom: 3,
    },
    invoiceTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 2,
        marginBottom: 5,
        borderBottomColor: '#000000',
        borderBottomWidth: 0.5,
        paddingBottom: 5,
    },
    section: {
        marginBottom: 5,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    text: {
        fontSize: 10,
        marginBottom: 2,
    },
    table: {
        display: 'flex',
        width: '100%',
        marginTop: 10,
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableHeaderRow: {
        flexDirection: 'row',
        borderBottomColor: '#000000',
        borderBottomWidth: 0.5,
        paddingBottom: 4,
        marginBottom: 4,
    },
    descriptionColHeader: {
        width: '40%', // Adjusted for new column
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'left',
    },
    qtyColHeader: {
        width: '15%', // Adjusted for new column
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'left',
    },
    unitPriceColHeader: { // NEW STYLE
        width: '20%',
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'left',
    },
    priceColHeader: {
        width: '25%', // Adjusted for new column (line total)
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'left',
    },
    descriptionCol: {
        width: '40%', // Adjusted for new column
        fontSize: 10,
        textAlign: 'left',
        wordWrap: 'break-word',
    },
    qtyCol: {
        width: '15%', // Adjusted for new column
        fontSize: 10,
        textAlign: 'left',
    },
    unitPriceCol: { // NEW STYLE
        width: '20%',
        fontSize: 10,
        textAlign: 'left',
    },
    priceCol: {
        width: '25%', // Adjusted for new column (line total)
        fontSize: 10,
        textAlign: 'left',
        wordWrap: 'break-word',
    },
    itemRowSeparator: {
        borderBottomColor: '#808080',
        borderBottomWidth: 0.2,
        marginTop: 4,
        marginBottom: 4,
    },
    totalsSection: {
        marginTop: 15,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 3,
    },
    totalLabelSmall: {
        fontSize: 8,
    },
    totalValueSmall: {
        fontSize: 8,
        fontWeight: 'normal',
        width: '50%',
        textAlign: 'right'
    },
    grandTotalValueSmall: {
        fontSize: 10,
        fontWeight: 'bold',
        width: '50%',
        textAlign: 'right'
    },
    paymentInfoSection: {
        marginTop: 5,
    },
    sectionTitleSmall: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    textSmall: {
        fontSize: 8,
        marginBottom: 2,
    },
    thankYouSmall: {
        fontSize: 14,
        marginTop: 10,
        marginBottom: 10,
    },
    footer: {
        fontSize: 6,
        color: '#808080',
        marginTop: 'auto',
        textAlign: 'center',
        paddingTop: 8,
        borderTopColor: '#000000',
        borderTopWidth: 0.5,
    },
    link: {
        color: 'blue',
        textDecoration: 'underline',
    }
});

const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return 'N0.00';
    }
    return `N${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

interface MinimalInvoiceDocumentProps {
    data: InvoiceData;
}

export const MinimalInvoiceDocument: React.FC<MinimalInvoiceDocumentProps> = ({ data }) => {
    return (
        <Document>
            <Page size="A6" style={styles.page}>

                <View style={styles.header} fixed>
                    <View style={styles.headerContent}> {/* NEW: Container for logo and business name */}
                        {data.businessLogo && ( // Conditionally render logo
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
                    <Text style={styles.text}>Customer: {data.customerName}</Text>
                    <Text style={styles.text}>Address: {data.customerAddress}</Text>
                    <Text style={styles.text}>Phone: {data.customerPhone}</Text>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeaderRow}>
                        <Text style={styles.descriptionColHeader}>Description</Text>
                        <Text style={styles.qtyColHeader}>Quantity</Text>
                        <Text style={styles.unitPriceColHeader}>Unit Price</Text> {/* NEW HEADER */}
                        <Text style={styles.priceColHeader}>Price</Text> {/* This is now line total */}
                    </View>

                    {data.items.map((item: InvoiceItem, index: number) => (
                        <View key={item.id || index.toString()}>
                            <View style={styles.tableRow}>
                                <Text style={styles.descriptionCol}>{item.description}</Text>
                                <Text style={styles.qtyCol}>{item.quantity}</Text>
                                <Text style={styles.unitPriceCol}>{formatCurrency(item.unit_price)}</Text> {/* NEW CELL */}
                                <Text style={styles.priceCol}>{formatCurrency((item.unit_price ?? 0) * (item.quantity ?? 0))}</Text> {/* Calculated line total */}
                            </View>
                            {index < data.items.length - 1 && (
                                <View style={styles.itemRowSeparator} />
                            )}
                        </View>
                    ))}
                </View>

                <View style={styles.totalsSection}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabelSmall}>Subtotal:</Text>
                        <Text style={styles.totalValueSmall}>
                            {formatCurrency(data.items.reduce((acc, item) => acc + ((item.unit_price ?? 0) * (item.quantity ?? 0)), 0))}
                        </Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabelSmall}>Discount:</Text>
                        <Text style={styles.totalValueSmall}>{formatCurrency(data.discount ?? 0)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabelSmall}>Tax:</Text>
                        <Text style={styles.totalValueSmall}>{formatCurrency(data.tax ?? 0)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabelSmall}>Total:</Text>
                        <Text style={styles.grandTotalValueSmall}>{formatCurrency(data.total)}</Text>
                    </View>
                </View>

                <View style={styles.paymentInfoSection}>
                    {data.invoiceType === "invoice" ? (
                        <View>
                            <Text style={styles.sectionTitleSmall}>Payment Information</Text>
                            <Text style={styles.textSmall}>Bank Name: {data.bankName}</Text>
                            <Text style={styles.textSmall}>Account Name: {data.accountName}</Text>
                            <Text style={styles.textSmall}>Account Number: {data.accountNumber}</Text>
                        </View>
                    ) : (
                        <Text style={styles.thankYouSmall}>Thank you!</Text>
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
};

export const generateMinimalPdf = async (data: InvoiceData): Promise<Blob> => {
    // For example, if you registered a font:
    // await Font.load({ family: 'Courier', src: 'path/to/Courier.ttf' });
    const blob = await pdf(<MinimalInvoiceDocument data={data} />).toBlob();
    return blob;
};