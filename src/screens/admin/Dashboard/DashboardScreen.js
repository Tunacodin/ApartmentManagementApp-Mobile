import React from 'react';
import { ScrollView, View, StyleSheet, Dimensions } from 'react-native';
import { Surface, Text, Card, List, useTheme, Avatar, ProgressBar, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts } from '../../../../App';

// Mock data
const mockData = {
  statistics: {
    totalResidents: 156,
    activeComplaints: 8,
    pendingPayments: 12,
    upcomingMeetings: 3
  },
  activities: [
    {
      id: 1,
      type: "payment",
      title: "Aidat Ödemesi",
      description: "A-12 Daire sakini aidatını ödedi",
      amount: 850,
      status: "paid",
      date: "2024-03-15T10:30:00"
    },
    {
      id: 2,
      type: "complaint",
      title: "Gürültü Şikayeti",
      description: "B-5 Daire hakkında gürültü şikayeti",
      status: "pending",
      date: "2024-03-14T16:45:00"
    },
    {
      id: 3,
      type: "maintenance",
      title: "Asansör Bakımı",
      description: "Aylık rutin asansör bakımı tamamlandı",
      amount: 1200,
      status: "completed",
      date: "2024-03-13T09:15:00"
    }
  ],
  financialSummary: {
    monthlyIncome: {
      current: 45000,
      target: 50000,
      percentage: 90
    },
    expenses: {
      current: 28000,
      target: 35000,
      percentage: 80
    },
    collections: {
      current: 42000,
      target: 48000,
      percentage: 87.5
    }
  },
  recentTransactions: [
    {
      id: 1,
      description: "Mart Ayı Aidat Ödemeleri",
      amount: 15000,
      type: "income",
      date: "2024-03-15"
    },
    {
      id: 2,
      description: "Bahçe Bakım Hizmeti",
      amount: 2500,
      type: "expense",
      date: "2024-03-14"
    },
    {
      id: 3,
      description: "Güvenlik Kamera Sistemi Bakımı",
      amount: 1800,
      type: "expense",
      date: "2024-03-13"
    }
  ]
};

const StatCard = ({ title, value, icon, gradient }) => {
  const theme = useTheme();
  return (
    <Surface style={styles.statCard} elevation={5}>
      <View style={{ overflow: 'hidden', borderRadius: 16 }}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          <Icon name={icon} size={32} color={theme.colors.text} />
          <Text style={[styles.statValue, { color: theme.colors.text, fontFamily: theme.fonts.regular.fontFamily }]}>{value}</Text>
          <Text style={[styles.statTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold.fontFamily }]}>{title}</Text>
        </LinearGradient>
      </View>
    </Surface>
  );
};

const FinancialCard = ({ title, current, target, percentage, gradient }) => {
  const theme = useTheme();
  return (
    <Card style={[styles.financialCard, { backgroundColor: theme.colors.surface }]}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBorder}
      />
      <Card.Content style={styles.financialContent}>
        <Text variant="titleMedium" style={{ color: theme.colors.text, fontFamily: theme.fonts.bold.fontFamily }}>{title}</Text>
        <Text variant="headlineMedium" style={[styles.financialAmount, { color: theme.colors.text, fontFamily: theme.fonts.regular.fontFamily }]}>
          {current.toLocaleString()} ₺
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.regular.fontFamily }}>
          Hedef: {target.toLocaleString()} ₺
        </Text>
        <ProgressBar 
          progress={percentage / 100} 
          color={gradient[0]}
          style={styles.progressBar}
        />
      </Card.Content>
    </Card>
  );
};

const ActivityItem = ({ activity }) => {
  const theme = useTheme();
  
  const getActivityIcon = (type) => {
    switch (type) {
      case 'payment':
        return 'cash';
      case 'complaint':
        return 'alert-circle';
      case 'maintenance':
        return 'tools';
      default:
        return 'information';
    }
  };

  const getStatusGradient = (status) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return theme.gradients.success;
      case 'pending':
        return theme.gradients.warning;
      default:
        return [theme.colors.textSecondary, theme.colors.textSecondary];
    }
  };

  return (
    <List.Item
      style={styles.activityItem}
      title={props => (
        <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.regular.fontFamily }}>{activity.title}</Text>
      )}
      description={props => (
        <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.regular.fontFamily }}>{activity.description}</Text>
      )}
      left={props => (
        <View style={styles.activityIconContainer}>
          <LinearGradient
            colors={getStatusGradient(activity.status)}
            style={styles.activityIconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name={getActivityIcon(activity.type)} size={24} color={theme.colors.text} />
          </LinearGradient>
        </View>
      )}
      right={props => (
        <View style={styles.activityRight}>
          <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.regular.fontFamily }}>
            {new Date(activity.date).toLocaleDateString('tr-TR')}
          </Text>
          {activity.amount && (
            <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.regular.fontFamily }}>
              {activity.amount} ₺
            </Text>
          )}
        </View>
      )}
    />
  );
};

const DashboardScreen = () => {
  const theme = useTheme();
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={[styles.header, { color: theme.colors.text, fontFamily: theme.fonts.bold.fontFamily }]}>
        Site Yönetim Paneli
      </Text>
      
      <View style={styles.statsContainer}>
        <StatCard
          title="Toplam Sakin"
          value={mockData.statistics.totalResidents}
          icon="account-group"
          gradient={theme.gradients.primary}
        />
        <StatCard
          title="Aktif Şikayet"
          value={mockData.statistics.activeComplaints}
          icon="alert-circle"
          gradient={theme.gradients.warning}
        />
        <StatCard
          title="Bekleyen Ödeme"
          value={mockData.statistics.pendingPayments}
          icon="cash-multiple"
          gradient={theme.gradients.danger}
        />
        <StatCard
          title="Yaklaşan Toplantı"
          value={mockData.statistics.upcomingMeetings}
          icon="calendar"
          gradient={theme.gradients.success}
        />
      </View>

      <View style={styles.financialContainer}>
        <FinancialCard
          title="Aylık Gelir"
          current={mockData.financialSummary.monthlyIncome.current}
          target={mockData.financialSummary.monthlyIncome.target}
          percentage={mockData.financialSummary.monthlyIncome.percentage}
          gradient={theme.gradients.success}
        />
        <FinancialCard
          title="Giderler"
          current={mockData.financialSummary.expenses.current}
          target={mockData.financialSummary.expenses.target}
          percentage={mockData.financialSummary.expenses.percentage}
          gradient={theme.gradients.danger}
        />
        <FinancialCard
          title="Tahsilatlar"
          current={mockData.financialSummary.collections.current}
          target={mockData.financialSummary.collections.target}
          percentage={mockData.financialSummary.collections.percentage}
          gradient={theme.gradients.primary}
        />
      </View>

      <Card style={[styles.activitiesCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Title 
          title="Son Aktiviteler" 
          titleStyle={{ color: theme.colors.text, fontFamily: theme.fonts.bold.fontFamily }}
        />
        <Card.Content>
          {(() => {
            if (!Array.isArray(mockData?.activities) || mockData.activities.length === 0) {
              return (
                <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.regular.fontFamily }}>
                  Aktivite bulunamadı
                </Text>
              );
            }

            const activityElements = [];
            for (let i = 0; i < mockData.activities.length; i++) {
              const activity = mockData.activities[i];
              activityElements.push(
                <React.Fragment key={activity.id || i}>
                  <ActivityItem activity={activity} />
                  {i < mockData.activities.length - 1 && (
                    <Divider style={{ backgroundColor: theme.colors.textSecondary, opacity: 0.1 }} />
                  )}
                </React.Fragment>
              );
            }
            return activityElements;
          })()}
        </Card.Content>
      </Card>

      <Card style={[styles.transactionsCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Title 
          title="Son İşlemler"
          titleStyle={{ color: theme.colors.text, fontFamily: theme.fonts.bold.fontFamily }}
        />
        <Card.Content>
          {(() => {
            if (!Array.isArray(mockData?.recentTransactions) || mockData.recentTransactions.length === 0) {
              return (
                <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.regular.fontFamily }}>
                  İşlem bulunamadı
                </Text>
              );
            }

            const transactionElements = [];
            for (let i = 0; i < mockData.recentTransactions.length; i++) {
              const transaction = mockData.recentTransactions[i];
              transactionElements.push(
                <List.Item
                  key={transaction.id || i}
                  title={props => (
                    <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.regular.fontFamily }}>
                      {transaction.description || 'İşlem detayı'}
                    </Text>
                  )}
                  description={props => (
                    <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.regular.fontFamily }}>
                      {transaction.date ? new Date(transaction.date).toLocaleDateString('tr-TR') : '-'}
                    </Text>
                  )}
                  right={() => (
                    <Text
                      style={{
                        color: transaction.type === 'income' ? theme.colors.success : theme.colors.error,
                        fontFamily: theme.fonts.regular.fontFamily,
                      }}
                    >
                      {transaction.type === 'income' ? '+' : '-'} {transaction.amount || 0} ₺
                    </Text>
                  )}
                  style={styles.transactionItem}
                />
              );
            }
            return transactionElements;
          })()}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    fontSize: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    marginBottom: 16,
  },
  gradientCard: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 16,
  },
  statValue: {
    fontSize: 28,
    marginVertical: 8,
  },
  statTitle: {
    fontSize: 14,
    opacity: 0.9,
  },
  financialContainer: {
    marginBottom: 24,
  },
  financialCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  financialContent: {
    padding: 16,
  },
  gradientBorder: {
    height: 4,
    width: '100%',
  },
  financialAmount: {
    marginVertical: 8,
    fontSize: 32,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 12,
  },
  activitiesCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  activityItem: {
    paddingVertical: 12,
  },
  activityIconContainer: {
    marginRight: 12,
  },
  activityIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  transactionsCard: {
    marginBottom: 90,
    borderRadius: 16,
    overflow: 'hidden',
  },
  transactionItem: {
    paddingVertical: 8,
  }
});

export default DashboardScreen;
