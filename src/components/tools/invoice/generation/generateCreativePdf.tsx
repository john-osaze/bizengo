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

// Register Helvetica font if not already registered, though it's often built-in
// Font.register({ family: 'Helvetica', fonts: [{ src: 'path/to/Helvetica.ttf' }] });

const colors = {
    blue500: 'rgb(59, 130, 246)',
    gray600: 'rgb(75, 85, 99)',
    blue400: 'rgb(96, 165, 250)',
    gray700: 'rgb(55, 65, 81)',
    gray200: 'rgb(229, 231, 235)',
    blue600: 'rgb(37, 99, 235)',
    gray500: 'rgb(107, 114, 128)',
};

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 0,
        fontFamily: 'Helvetica',
    },
    header: {
        textAlign: 'center',
        backgroundColor: colors.blue500,
        paddingVertical: 10,
        paddingHorizontal: 25,
    },
    // NEW: Container for logo and business name
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15, // Keep original top margin
        marginBottom: 4, // Keep original bottom margin
    },
    // NEW: Style for the logo image
    logo: {
        width: 35, // Adjust size as needed
        height: 35, // Adjust size as needed
        marginRight: 10, // Space between logo and text
        objectFit: 'contain', // Ensures the image fits within the bounds without distortion
    },
    businessName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        // Removed margins, now handled by headerContent
    },
    businessInfo: {
        fontSize: 10.5,
        color: '#FFFFFF',
        marginBottom: 2,
    },
    invoiceTitle: {
        fontSize: 13.5,
        fontWeight: 'bold',
        marginTop: 6,
        marginBottom: 1,
        color: '#FFFFFF',
    },
    contentWrapper: {
        paddingHorizontal: 20,
        paddingTop: 20,
        flexGrow: 1,
    },
    section: {
        marginBottom: 5,
    },
    sectionTitle: {
        fontSize: 10.5,
        fontWeight: 'bold',
        marginBottom: 4,
        color: colors.gray700,
    },
    text: {
        fontSize: 10.5,
        marginBottom: 2,
        color: colors.gray700,
    },
    table: {
        width: '100%',
        marginTop: 15,
        marginBottom: 15,
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: colors.gray200,
        paddingVertical: 12,
        borderBottomColor: colors.gray200,
        borderBottomWidth: 0.75,
    },
    descriptionColHeader: {
        width: '40%', // Adjusted for new column
        fontSize: 10.5,
        fontWeight: 'bold',
        paddingLeft: 9,
        color: colors.gray700,
        textAlign: 'left',
    },
    qtyColHeader: {
        width: '15%', // Adjusted for new column
        fontSize: 10.5,
        fontWeight: 'bold',
        textAlign: 'left',
        color: colors.gray700,
    },
    unitPriceColHeader: { // NEW STYLE
        width: '20%',
        fontSize: 10.5,
        fontWeight: 'bold',
        textAlign: 'left',
        color: colors.gray700,
    },
    priceColHeader: {
        width: '25%', // Adjusted for new column (line total)
        fontSize: 10.5,
        fontWeight: 'bold',
        textAlign: 'left',
        paddingRight: 9,
        color: colors.gray700,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 9,
        borderBottomColor: colors.gray200,
        borderBottomWidth: 0.5,
    },
    descriptionCol: {
        width: '40%', // Adjusted for new column
        fontSize: 10.5,
        paddingLeft: 9,
        color: colors.gray700,
        textAlign: 'left',
        wordWrap: 'break-word',
    },
    qtyCol: {
        width: '15%', // Adjusted for new column
        fontSize: 10.5,
        textAlign: 'left',
        color: colors.gray700,
    },
    unitPriceCol: { // NEW STYLE
        width: '20%',
        fontSize: 10.5,
        textAlign: 'left',
        color: colors.gray700,
    },
    priceCol: {
        width: '25%', // Adjusted for new column (line total)
        fontSize: 10.5,
        textAlign: 'left',
        paddingRight: 9,
        color: colors.gray700,
        wordWrap: 'break-word',
    },
    totalsContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingTop: 15,
        borderTopColor: colors.gray200,
        borderTopWidth: 0.75,
        width: '100%',
    },
    paymentInfoContainer: {
        marginTop: 15,
        width: '100%',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 3,
    },
    totalLabel: {
        fontSize: 10.5,
        color: colors.gray700,
    },
    totalValue: {
        fontSize: 10.5,
        fontWeight: 'normal',
        color: colors.gray700,
        textAlign: 'right',
        minWidth: 70,
    },
    grandTotalLabel: {
        fontSize: 13.5,
        fontWeight: 'bold',
        color: colors.blue600,
    },
    grandTotalValue: {
        fontSize: 13.5,
        fontWeight: 'bold',
        color: colors.blue600,
        textAlign: 'right',
        minWidth: 70,
    },
    thankYou: {
        fontSize: 18.75,
        color: colors.blue600,
        marginTop: 15,
    },
    footer: {
        fontSize: 7,
        color: colors.gray500,
        marginTop: 'auto',
        marginBottom: 10,
        textAlign: 'center',
        paddingTop: 8,
        paddingHorizontal: 25,
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

interface CreativeInvoiceDocumentProps {
    data: InvoiceData;
}

export const CreativeInvoiceDocument: React.FC<CreativeInvoiceDocumentProps> = ({ data }) => {
    return (
        <Document>
            <Page size="A5" style={styles.page}>

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

                <View style={styles.contentWrapper}>
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
                            <View style={styles.tableRow} key={item.id || index.toString()}>
                                <Text style={styles.descriptionCol}>{item.description}</Text>
                                <Text style={styles.qtyCol}>{item.quantity}</Text>
                                <Text style={styles.unitPriceCol}>
                                    {formatCurrency(item.unit_price)}
                                </Text> {/* NEW CELL */}
                                <Text style={styles.priceCol}>
                                    {formatCurrency((item.unit_price ?? 0) * (item.quantity ?? 0))}
                                </Text> {/* Calculated line total */}
                            </View>
                        ))}
                    </View>

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
                            <Text style={styles.grandTotalLabel}>Total:</Text>
                            <Text style={styles.grandTotalValue}>{formatCurrency(data.total)}</Text>
                        </View>
                    </View>

                    <View style={styles.paymentInfoContainer}>
                        {data.invoiceType === "invoice" ? (
                            <View>
                                <Text style={styles.sectionTitle}>Payment Information</Text>
                                <Text style={styles.text}>Bank Name: {data.bankName}</Text>
                                <Text style={styles.text}>Account Name: {data.accountName}</Text>
                                <Text style={styles.text}>Account Number: {data.accountNumber}</Text>
                            </View>
                        ) : (
                            <Text style={styles.thankYou}>Thank you</Text>
                        )}
                    </View>
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

export const generateCreativePdf = async (data: InvoiceData): Promise<Blob> => {
    const blob = await pdf(<CreativeInvoiceDocument data={data} />).toBlob();
    return blob;
};