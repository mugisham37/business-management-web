/**
 * MFA Setup Screen for Mobile
 * Complete QR code scanning and TOTP setup implementation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Clipboard,
  Dimensions,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Camera } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@apollo/client';
import { GENERATE_MFA_SETUP_MUTATION, ENABLE_MFA_MUTATION } from '@/graphql/mutations/auth-mutations';
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/Input';
import { Card } from '@/components/core/Card';

interface MfaSetupScreenProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function MfaSetupScreen({ onComplete, onCancel }: MfaSetupScreenProps) {
  const [step, setStep] = useState<'generate' | 'scan' | 'verify'>('generate');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [mfaData, setMfaData] = useState<{
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
    manualEntryKey: string;
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const [generateMfaSetup, { loading: generating }] = useMutation(GENERATE_MFA_SETUP_MUTATION);
  const [enableMfa, { loading: enabling }] = useMutation(ENABLE_MFA_MUTATION);

  useEffect(() => {
    getCameraPermissions();
    handleGenerateSetup();
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleGenerateSetup = async () => {
    try {
      const result = await generateMfaSetup();
      if (result.data?.generateMfaSetup) {
        setMfaData(result.data.generateMfaSetup);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate MFA setup. Please try again.');
      console.error('MFA setup generation error:', error);
    }
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    
    // Parse TOTP URL
    try {
      const url = new URL(data);
      if (url.protocol === 'otpauth:' && url.hostname === 'totp') {
        const secret = url.searchParams.get('secret');
        if (secret === mfaData?.secret) {
          Alert.alert(
            'QR Code Scanned Successfully',
            'The authenticator app has been configured. Please enter a verification code.',
            [{ text: 'OK', onPress: () => setStep('verify') }]
          );
        } else {
          Alert.alert('Error', 'Invalid QR code. Please scan the correct code.');
          setScanned(false);
        }
      } else {
        Alert.alert('Error', 'Invalid QR code format.');
        setScanned(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to parse QR code.');
      setScanned(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code.');
      return;
    }

    try {
      const result = await enableMfa({
        variables: {
          input: { token: verificationCode }
        }
      });

      if (result.data?.enableMfa?.success) {
        setShowBackupCodes(true);
      } else {
        Alert.alert('Error', 'Invalid verification code. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify code. Please try again.');
      console.error('MFA verification error:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'Text copied to clipboard');
  };

  const handleComplete = () => {
    Alert.alert(
      'MFA Enabled Successfully',
      'Two-factor authentication has been enabled for your account. Please save your backup codes in a secure location.',
      [{ text: 'OK', onPress: onComplete }]
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
        <Button onPress={getCameraPermissions}>Grant Permission</Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.title}>Setup Two-Factor Authentication</Text>
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        <View style={[styles.step, step === 'generate' && styles.activeStep]}>
          <Text style={styles.stepNumber}>1</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.step, step === 'scan' && styles.activeStep]}>
          <Text style={styles.stepNumber}>2</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.step, step === 'verify' && styles.activeStep]}>
          <Text style={styles.stepNumber}>3</Text>
        </View>
      </View>

      {/* Content based on current step */}
      {step === 'generate' && mfaData && (
        <View style={styles.content}>
          <Text style={styles.stepTitle}>Step 1: QR Code Generated</Text>
          <Text style={styles.description}>
            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </Text>

          <Card style={styles.qrContainer}>
            <QRCode
              value={mfaData.qrCodeUrl}
              size={200}
              backgroundColor="white"
              color="black"
            />
          </Card>

          <Text style={styles.manualEntryLabel}>Manual Entry Key:</Text>
          <TouchableOpacity
            style={styles.manualEntryContainer}
            onPress={() => copyToClipboard(mfaData.manualEntryKey)}
          >
            <Text style={styles.manualEntryKey}>{mfaData.manualEntryKey}</Text>
            <Ionicons name="copy" size={20} color="#007AFF" />
          </TouchableOpacity>

          <Button
            onPress={() => setStep('scan')}
            style={styles.nextButton}
          >
            I've Added the Account
          </Button>
        </View>
      )}

      {step === 'scan' && (
        <View style={styles.content}>
          <Text style={styles.stepTitle}>Step 2: Verify Setup</Text>
          <Text style={styles.description}>
            Scan the QR code below with your authenticator app to verify the setup
          </Text>

          <View style={styles.scannerContainer}>
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={styles.scanner}
            />
            {scanned && (
              <TouchableOpacity
                style={styles.scanAgainButton}
                onPress={() => setScanned(false)}
              >
                <Text style={styles.scanAgainText}>Tap to Scan Again</Text>
              </TouchableOpacity>
            )}
          </View>

          <Button
            onPress={() => setStep('verify')}
            variant="outline"
            style={styles.skipButton}
          >
            Skip Scanning - Enter Code Manually
          </Button>
        </View>
      )}

      {step === 'verify' && (
        <View style={styles.content}>
          <Text style={styles.stepTitle}>Step 3: Enter Verification Code</Text>
          <Text style={styles.description}>
            Enter the 6-digit code from your authenticator app
          </Text>

          <Input
            placeholder="000000"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="numeric"
            maxLength={6}
            style={[styles.codeInput, { fontSize: 24, textAlign: 'center' }]}
          />

          <Button
            onPress={handleVerifyCode}
            loading={enabling}
            disabled={verificationCode.length !== 6}
            style={styles.verifyButton}
          >
            Verify & Enable MFA
          </Button>
        </View>
      )}

      {/* Backup Codes Modal */}
      {showBackupCodes && mfaData && (
        <View style={styles.backupCodesContainer}>
          <Text style={styles.backupCodesTitle}>Save Your Backup Codes</Text>
          <Text style={styles.backupCodesDescription}>
            Store these codes in a safe place. You can use them to access your account if you lose your authenticator device.
          </Text>

          <View style={styles.backupCodesList}>
            {mfaData.backupCodes.map((code, index) => (
              <TouchableOpacity
                key={index}
                style={styles.backupCodeItem}
                onPress={() => copyToClipboard(code)}
              >
                <Text style={styles.backupCode}>{code}</Text>
                <Ionicons name="copy" size={16} color="#666" />
              </TouchableOpacity>
            ))}
          </View>

          <Button
            onPress={handleComplete}
            style={styles.completeButton}
          >
            I've Saved My Backup Codes
          </Button>
        </View>
      )}
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    flex: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  step: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStep: {
    backgroundColor: '#007AFF',
  },
  stepNumber: {
    color: 'white',
    fontWeight: '600',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
  content: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  qrContainer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  manualEntryLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  manualEntryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  manualEntryKey: {
    fontFamily: 'monospace',
    fontSize: 14,
    marginRight: 8,
  },
  nextButton: {
    marginTop: 20,
  },
  scannerContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  scanner: {
    flex: 1,
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanAgainText: {
    color: 'white',
    fontWeight: '600',
  },
  skipButton: {
    marginTop: 10,
  },
  codeInput: {
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 20,
  },
  verifyButton: {
    marginTop: 20,
  },
  backupCodesContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backupCodesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  backupCodesDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  backupCodesList: {
    marginBottom: 20,
  },
  backupCodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  backupCode: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#28a745',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
});