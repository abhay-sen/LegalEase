import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ScrollView,
  Linking,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Button,
  Modal,
  IconButton,
  Text,
  Divider,
} from 'react-native-paper';

// --- TYPE DEFINITIONS ---
interface Clause {
  title: string;
  text: string;
}

interface Report {
  summary: string;
  parties: string[];
  important_dates: string[];
  document_type: string;
  clauses: Clause[];
  signatories: string[];
}

export interface ReportData {
  id: number;
  created_at: string;
  fileLink: string;
  report: Report;
  userId: string;
}

// --- PROPS DEFINITION for the component ---
interface ReportsDisplayProps {
  reports: ReportData[];
  onRefresh: () => void; // Function to call when user pulls to refresh
  isRefreshing: boolean; // The loading state for the refresh control
}

// --- HELPER FUNCTIONS ---
const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

// --- SUB-COMPONENTS ---
const DetailSection: React.FC<{ title: string; items: string[] }> = ({
  title,
  items,
}) => (
  <View style={styles.detailSection}>
    <Text style={styles.detailSectionTitle}>{title}</Text>
    {items.map((item, index) => (
      <Text key={index} style={styles.detailItem}>
        • {item}
      </Text>
    ))}
  </View>
);

/**
 * The main component to display the list of report cards.
 * It is now a pure component that fits into any parent view.
 */
const ReportsDisplay: React.FC<ReportsDisplayProps> = ({
  reports,
  onRefresh,
  isRefreshing,
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);

  const handleCardClick = (report: ReportData) => setSelectedReport(report);
  const handleCloseModal = () => setSelectedReport(null);

  const openUrl = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', `Failed to open the link. Please try again.`);
      console.error('Failed to open URL:', error);
    }
  };

  const handleViewPdf = (url: string) => {
    openUrl(url);
  };

  const handleDownloadPdf = (url: string) => {
    const downloadUrl = `${url}?download=true`;
    openUrl(downloadUrl);
  };

  const renderItem = ({ item }: { item: ReportData }) => (
    <Card style={styles.card} onPress={() => handleCardClick(item)}>
      <Card.Content>
        <Text style={styles.cardType}>{item.report.document_type}</Text>
        <Text style={styles.cardTitle}>Report ID: {item.id}</Text>
        <Text style={styles.cardSummary} numberOfLines={3}>
          {item.report.summary}
        </Text>
      </Card.Content>
      <Card.Actions>
        <Text style={styles.cardDate}>
          Created: {formatDateTime(item.created_at)}
        </Text>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        // Added pull-to-refresh functionality
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      />

      <Modal
        visible={!!selectedReport}
        onDismiss={handleCloseModal}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Report Details</Text>
          <IconButton icon="close" size={24} onPress={handleCloseModal} />
        </View>
        <ScrollView style={styles.modalScrollView}>
          {selectedReport && (
            <View style={styles.modalContent}>
              <Text style={styles.detailSectionTitle}>Summary</Text>
              <Text style={styles.paragraph}>
                {selectedReport.report.summary}
              </Text>
              <Divider style={styles.divider} />

              <DetailSection
                title="Parties Involved"
                items={selectedReport.report.parties}
              />
              <DetailSection
                title="Important Dates"
                items={selectedReport.report.important_dates}
              />
              <DetailSection
                title="Signatories"
                items={selectedReport.report.signatories}
              />

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Document Type</Text>
                <Text style={styles.detailItem}>
                  {selectedReport.report.document_type}
                </Text>
              </View>

              <Text style={styles.detailSectionTitle}>Key Clauses</Text>
              {selectedReport.report.clauses.map((clause, index) => (
                <Card key={index} style={styles.clauseCard}>
                  <Card.Content>
                    <Text style={styles.clauseTitle}>{clause.title}</Text>
                    <Text style={styles.paragraph}>{clause.text}</Text>
                  </Card.Content>
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
        <View style={styles.modalActions}>
          <Button
            icon="eye"
            mode="contained"
            onPress={() => handleViewPdf(selectedReport!.fileLink)}
            style={styles.button}
          >
            View PDF
          </Button>
          <Button
            icon="download"
            mode="outlined"
            onPress={() => handleDownloadPdf(selectedReport!.fileLink)}
            style={styles.button}
          >
            Download PDF
          </Button>
        </View>
      </Modal>
    </View>
  );
};

export default ReportsDisplay;

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1, // This makes the component fill its parent
  },
  list: {
    padding: 16,
    paddingTop: 0, // Removed top padding as parent will handle it
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardType: {
    fontSize: 12,
    color: '#005A9C', // A professional blue for light theme
    marginBottom: 4,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c1c1e', // Dark text color
  },
  cardSummary: {
    marginTop: 8,
    fontSize: 14,
    color: '#3c3c43', // Slightly lighter text color
  },
  cardDate: {
    fontSize: 12,
    color: '#8e8e93', // Gray color for metadata
    marginLeft: 8,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1c1c1e',
  },
  modalScrollView: {
    flex: 1,
  },
  modalContent: {
    padding: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#e5e5ea',
  },
  detailSection: {
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005A9C', // Professional blue
    marginBottom: 8,
  },
  detailItem: {
    fontSize: 16,
    color: '#3c3c43',
    marginLeft: 8,
    lineHeight: 24,
  },
  clauseCard: {
    marginTop: 8,
    backgroundColor: '#f9f9f9',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    elevation: 0,
  },
  clauseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 16,
    color: '#3c3c43',
    lineHeight: 24,
  },
});