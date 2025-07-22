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
import {
    InventoryAndOrderReportData,
    InventoryReportData,
    OrderReportData,
} from '@/types/inventory'; // Assuming types/inventory.ts is updated with businessLogo

// Register fonts if needed
// Font.register({ family: 'Roboto', src: '/fonts/Roboto-Regular.ttf' });
// Font.register({ family: 'Roboto-Bold', src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' });

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
        marginBottom: 4, // Adjust as needed with new layout
    },
    // END NEW STYLES
    businessInfo: {
        fontSize: 10,
        marginBottom: 2,
    },
    reportTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 8,
    },
    generationDate: {
        fontSize: 10,
        textAlign: 'center',
        marginBottom: 10,
    },
    separatorLine: {
        borderBottomColor: '#B4B4B4',
        borderBottomWidth: 0.5,
        marginBottom: 15,
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
    tableCell: {
        fontSize: 8,
        paddingVertical: 5,
        paddingHorizontal: 5,
        textAlign: 'left',
        borderRightColor: '#DCDCDC',
        borderRightWidth: 0.2,
    },
    lastColBorder: {
        borderRightWidth: 0,
    },
    lastTableRow: {
        borderBottomWidth: 0,
    },

    inventoryNameCol: { width: '28%', },
    inventoryModelCol: { width: '12%', },
    inventoryCategoryCol: { width: '17%', },
    inventoryCurrentStockCol: { width: '8%', },
    inventoryThresholdCol: { width: '8%', },
    inventoryUnitPriceCol: { width: '17%', },
    inventoryLastRestockedCol: { width: '10%', },

    orderIdCol: { width: '10%', },
    orderSupplierCol: { width: '25%', },
    orderItemsCol: { width: '25%', },
    orderStatusCol: { width: '10%', },
    orderExpectedDeliveryCol: { width: '14%', },
    orderTotalValueCol: { width: '17%', },

    footer: {
        fontSize: 8,
        color: '#808080',
        marginTop: 'auto',
        textAlign: 'center',
        paddingTop: 10,
    }
});

interface InventoryOrderDocumentProps {
    data: InventoryAndOrderReportData;
}

export const InventoryOrderDocument: React.FC<InventoryOrderDocumentProps> = ({ data }) => {
    return (
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

                    <Text style={styles.reportTitle}>
                        {data.reportType === 'inventory' ? 'Inventory Report' : 'Order Report'}
                    </Text>

                    <Text style={styles.generationDate}>Generated On: {data.generationDate}</Text>
                    <View style={styles.separatorLine} />
                </View>

                {data.reportType === 'inventory' ? (

                    <View style={styles.table}>

                        <View style={styles.tableHeaderRow}>
                            <Text style={[styles.tableHeaderCell, styles.inventoryNameCol]}>Product</Text>
                            <Text style={[styles.tableHeaderCell, styles.inventoryModelCol]}>Model</Text>
                            <Text style={[styles.tableHeaderCell, styles.inventoryCategoryCol]}>Category</Text>
                            <Text style={[styles.tableHeaderCell, styles.inventoryThresholdCol]}>Threshold</Text>
                            <Text style={[styles.tableHeaderCell, styles.inventoryCurrentStockCol]}>Stock</Text>
                            <Text style={[styles.tableHeaderCell, styles.inventoryUnitPriceCol]}>Unit Price</Text>

                            <Text style={[styles.tableHeaderCell, styles.inventoryLastRestockedCol, styles.lastColBorder]}>Last Restocked</Text>
                        </View>

                        {(data as InventoryReportData).inventoryItems.map((item, index) => (
                            <View
                                style={[
                                    styles.tableRow,
                                    index === (data as InventoryReportData).inventoryItems.length - 1 ? styles.lastTableRow : {} // Fix TypeScript error
                                ]}
                                key={item.id || index.toString()}
                            >
                                <Text style={[styles.tableCell, styles.inventoryNameCol]}>{item.name}</Text>
                                <Text style={[styles.tableCell, styles.inventoryModelCol]}>{item.model}</Text>
                                <Text style={[styles.tableCell, styles.inventoryCategoryCol]}>{item.category}</Text>
                                <Text style={[styles.tableCell, styles.inventoryThresholdCol]}>{item.minStock.toLocaleString()}</Text>
                                <Text style={[styles.tableCell, styles.inventoryCurrentStockCol]}>{item.currentStock.toLocaleString()}</Text>
                                <Text style={[styles.tableCell, styles.inventoryUnitPriceCol]}>N{item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>

                                <Text style={[styles.tableCell, styles.inventoryLastRestockedCol, styles.lastColBorder]}>{item.lastRestocked}</Text>
                            </View>
                        ))}
                    </View>
                ) : (

                    <View style={styles.table}>

                        <View style={styles.tableHeaderRow}>
                            <Text style={[styles.tableHeaderCell, styles.orderIdCol]}>Order ID</Text>
                            <Text style={[styles.tableHeaderCell, styles.orderSupplierCol]}>Supplier</Text>
                            <Text style={[styles.tableHeaderCell, styles.orderItemsCol]}>Items</Text>
                            <Text style={[styles.tableHeaderCell, styles.orderStatusCol]}>Status</Text>
                            <Text style={[styles.tableHeaderCell, styles.orderExpectedDeliveryCol]}>Delivery Date</Text>

                            <Text style={[styles.tableHeaderCell, styles.orderTotalValueCol, styles.lastColBorder]}>Value</Text>
                        </View>

                        {(data as OrderReportData).orders.map((order, index) => {
                            const truncatedId = `...${order.id.slice(-3)}`;
                            return (
                                <View
                                    style={[
                                        styles.tableRow,
                                        index === (data as OrderReportData).orders.length - 1 ? styles.lastTableRow : {}
                                    ]}
                                    key={order.id || index.toString()}
                                >
                                    <Text style={[styles.tableCell, styles.orderIdCol]}>{truncatedId}</Text>
                                    <Text style={[styles.tableCell, styles.orderSupplierCol]}>{order.supplier}</Text>

                                    <Text style={[styles.tableCell, styles.orderItemsCol]}>{order.items}</Text>
                                    <Text style={[styles.tableCell, styles.orderStatusCol]}>{order.status}</Text>
                                    <Text style={[styles.tableCell, styles.orderExpectedDeliveryCol]}>{order.expectedDelivery}</Text>

                                    <Text style={[styles.tableCell, styles.orderTotalValueCol, styles.lastColBorder]}>N{order.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                                </View>
                            )
                        })}
                    </View>
                )}

                <Text style={styles.footer} fixed>
                    Powered by Roots & Squares
                </Text>
            </Page>
        </Document>
    );
};

export const generateInventoryOrderPdf = async (data: InventoryAndOrderReportData): Promise<Blob> => {
    const blob = await pdf(<InventoryOrderDocument data={data} />).toBlob();
    return blob;
};