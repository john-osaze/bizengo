import React from 'react';
import {
    Document,
    Page,
    View,
    Text,
    StyleSheet,
    Font,
    pdf,
    Image // <--- Import Image component
} from '@react-pdf/renderer';

// Redefine interfaces here assuming types/credit.ts is not directly modified for this response
// In a real app, you would import these from '@/types/credit'
export interface CreditRecordItem {
    id: string;
    customerName: string;
    customerPhone: string;
    amount: number;
    description: string;
    dateCreated: string;
    dueDate: string;
    status: "pending" | "paid" | "overdue" | "deleted";
    paymentProbability?: number;
    riskScore?: number;
    aiInsights?: string[];
}

export interface CreditRecordData {
    credits: CreditRecordItem[];
    totalPending: number;
    totalCollected: number;
    generationDate: string;
    businessName?: string;
    businessAddress?: string;
    businessPhone?: string;
    businessLogo?: string | null; // <--- ADDED HERE
}


// If you have specific fonts you want to use, register them:
// Font.register({ family: 'Roboto', src: '/fonts/Roboto-Regular.ttf' });
// Font.register({ family: 'Roboto-Bold', src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' });
// Default will be Helvetica if not registered.

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        textAlign: 'center',
    },
    // <--- NEW STYLES FOR LOGO AND HEADER CONTENT
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    logo: {
        width: 40, // Adjust size as needed
        height: 40, // Adjust size as needed
        marginRight: 10, // Space between logo and text
        objectFit: 'contain', // Ensures the image fits within the bounds without distortion
    },
    // END NEW STYLES
    businessName: {
        fontSize: 18,
        fontWeight: 'bold',
        // marginBottom: 4, // Removed, now handled by headerContent
    },
    businessInfo: {
        fontSize: 10,
        marginBottom: 2,
    },
    reportTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
    },
    reportSubtitle: {
        fontSize: 14,
        marginBottom: 10,
    },
    generationDate: {
        fontSize: 10,
        textAlign: 'left',
        marginBottom: 10,
    },
    separatorLine: {
        borderBottomColor: '#808080',
        borderBottomWidth: 0.5,
        marginBottom: 15,
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    summaryCard: {
        flexDirection: 'column',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#F7F7F7',
        minWidth: '45%',
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#555',
    },
    cardValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    table: {
        width: '100%',
        marginTop: 10,
        borderWidth: 0.5,
        borderColor: '#B4B4B4',
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#F0F0F0',
        borderBottomColor: '#B4B4B4',
        borderBottomWidth: 0.5,
    },
    tableHeaderCell: {
        fontSize: 9,
        fontWeight: 'bold',
        paddingVertical: 8,
        paddingHorizontal: 5,
        textAlign: 'left',
        borderRightColor: '#B4B4B4',
        borderRightWidth: 0.5,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomColor: '#DCDCDC',
        borderBottomWidth: 0.2,
    },
    lastTableRow: {
        borderBottomWidth: 0,
    },
    tableCell: {
        fontSize: 8,
        paddingVertical: 5,
        paddingLeft: 2,
        textAlign: 'left',
        borderRightColor: '#DCDCDC',
        borderRightWidth: 0.2,
    },
    idCol: { width: '8%', },
    customerNameCol: { width: '17%', },
    customerPhoneCol: { width: '14%', },
    amountCol: { width: '14%', },
    dueDateCol: { width: '10%', },
    statusCol: { width: '8%', },
    descriptionCol: { width: '29%', },

    lastColBorder: {
        borderRightWidth: 0,
    },

    footer: {
        fontSize: 8,
        color: '#808080',
        marginTop: 'auto',
        textAlign: 'center',
        paddingTop: 10,
    }
});

interface CreditRecordDocumentProps {
    data: CreditRecordData;
}

export const CreditRecordDocument: React.FC<CreditRecordDocumentProps> = ({ data }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header} fixed>
                {/* <--- NEW: Conditional rendering of business logo and name */}
                {data.businessName && (
                    <View style={styles.headerContent}>
                        {data.businessLogo && (
                            <Image src={data.businessLogo} style={styles.logo} />
                        )}
                        <Text style={styles.businessName}>{data.businessName}</Text>
                    </View>
                )}
                {/* END NEW */}
                {data.businessAddress && (
                    <Text style={styles.businessInfo}>{data.businessAddress}</Text>
                )}
                {data.businessPhone && (
                    <Text style={styles.businessInfo}>Phone: {data.businessPhone}</Text>
                )}

                <Text style={styles.reportTitle}>Credit Report</Text>
                <Text style={styles.reportSubtitle}>A list of your credits.</Text>

                <Text style={styles.generationDate}>Generated On: {data.generationDate}</Text>
                <View style={styles.separatorLine} />
            </View>

            <View style={styles.summaryContainer}>
                <View style={styles.summaryCard}>
                    <Text style={styles.cardTitle}>Total Pending:</Text>
                    <Text style={styles.cardValue}>
                        N{data.totalPending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.cardTitle}>Total Collected:</Text>
                    <Text style={styles.cardValue}>
                        N{data.totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                </View>
            </View>

            <View style={styles.table}>
                <View style={styles.tableHeaderRow}>
                    <Text style={[styles.tableHeaderCell, styles.idCol]}>ID</Text>
                    <Text style={[styles.tableHeaderCell, styles.customerNameCol]}>Customer Name</Text>
                    <Text style={[styles.tableHeaderCell, styles.customerPhoneCol]}>Phone</Text>
                    <Text style={[styles.tableHeaderCell, styles.amountCol]}>Amount</Text>
                    <Text style={[styles.tableHeaderCell, styles.dueDateCol]}>Due Date</Text>
                    <Text style={[styles.tableHeaderCell, styles.statusCol]}>Status</Text>

                    <Text style={[styles.tableHeaderCell, styles.descriptionCol, styles.lastColBorder]}>Description</Text>
                </View>

                {data.credits.map((credit, index) => {
                    const truncatedId = `...${credit.id.slice(-3)}`;
                    const customerName = credit.customerName.length > 20 ? credit.customerName.slice(0, 20) + "..." : credit.customerName;

                    return (
                        <View
                            style={[
                                styles.tableRow,
                                index === data.credits.length - 1 ? styles.lastTableRow : {}
                            ]}
                            key={credit.id}
                        >
                            <Text style={[styles.tableCell, styles.idCol]}>{truncatedId}</Text>
                            <Text style={[styles.tableCell, styles.customerNameCol]}>{customerName}</Text>
                            <Text style={[styles.tableCell, styles.customerPhoneCol]}>{credit.customerPhone}</Text>
                            <Text style={[styles.tableCell, styles.amountCol]}>
                                N{credit.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Text>
                            <Text style={[styles.tableCell, styles.dueDateCol]}>{credit.dueDate}</Text>
                            <Text style={[styles.tableCell, styles.statusCol]}>{credit.status || 'N/A'}</Text>

                            <Text style={[styles.tableCell, styles.descriptionCol, styles.lastColBorder]}>{credit.description}</Text>
                        </View>
                    );
                })}
            </View>

            <Text style={styles.footer} fixed>
                Powered by Roots & Squares
            </Text>
        </Page>
    </Document>
);

export const generateCreditRecordPdf = async (data: CreditRecordData): Promise<Blob> => {
    const blob = await pdf(<CreditRecordDocument data={data} />).toBlob();
    return blob;
};