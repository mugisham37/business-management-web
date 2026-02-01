/**
 * MFA Verification Screen for Mobile
 * TOTP and backup code verification implementation
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
  Animated,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@apollo/client';
import { VERIFY_MFA_TOKEN_MUTATION } from '@/graphql/mutations/auth-mutations';
import { Button } from '@/components/core/Button';
import { Card } from '@/components/core/Card';

interface MfaVerificationScreenProps {
  email: string;
  onSuccess: (token: string) => void;
  onCancel: () => void;
  onUseBackupCode: () => void;
}

export function MfaVerificationScreen({
  email,
  onSuccess,
  onCancel,
  onUseBackupCode,
}: MfaVerificationScreenProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isBackupMode, setIsBackupMode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const [verifyMfaToken, { loading }] = useMutation(VERIFY_MFA_TOKEN_MUTATION);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCodeChange = (value: string, index: number) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit !== '') && !isBackupMode) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const tokenToVerify = verificationCode || (isBackupMode ? backupCode : code.join(''));
    
    if (!tokenToVerify || (isBackupMode ? tokenToVerify.length !== 8 : tokenToVerify.length !== 6)) {
      shakeInputs();
      Alert.alert('Error', `Please enter a valid ${isBackupMode ? '8-character backup code' : '6-digit code'}.`);
      return;
    }

    try {
      const result = await verifyMfaToken({
        variables: {
          input: {
            email,
            token: tokenToVerify,
            isBackupCode: isBackupMode,
          }
        }
      });

      if (result.data?.verifyMfaToken?.success) {
        Vibration.vibrate(100); // Success vibration
        onSuccess(tokenToVerify);
      } else {
        shakeInputs();
        Vibration.vibrate([100, 100, 100]); // Error vibration pattern
        Alert.alert(
          'Invalid Code',
          isBackupMode 
            ? 'The backup code you entered is invalid or has already been used.'
            : 'The verification code is incorrect. Please try again.'
        );
        
        // Clear inputs
        if (isBackupMode) {
          setBackupCode('');
        } else {
          setCode(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      }
    } catch (error) {
      shakeInputs();
      Alert.alert('Error', 'Failed to verify code. Please try again.');
      console.error('MFA verification error:', error);
    }
  };

  const shakeInputs = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const toggleBackupMode = () => {
    setIsBackupMode(!isBackupMode);
    setCode(['', '', '', '', '', '']);
    setBackupCode('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Two-Factor Authentication</Text>
      </View>

      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons 
            name={isBackupMode ? "key" : "shield-checkmark"} 
            size={60} 
            color="#007AFF" 
          />
        </View>

        {/* Instructions */}
        <Text style={styles.instruction}>
          {isBackupMode 
            ? 'Enter one of your 8-character backup codes'
            : 'Enter the 6-digit code from your authenticator app'
          }
        </Text>

        <Text style={styles.email}>{email}</Text>

        {/* Code Input */}
        <Animated.View 
          style={[
            styles.inputContainer,
            { transform: [{ translateX: shakeAnimation }] }
          ]}
        >
          {isBackupMode ? (
            <TextInput
              style={[styles.backupCodeInput, { fontFamily: 'monospace', textAlign: 'center' }]}
              value={backupCode}
              onChangeText={setBackupCode}
              placeholder="XXXXXXXX"
              placeholderTextColor="#999"
              autoCapitalize="characters"
              maxLength={8}
              autoFocus
            />
          ) : (
            <View style={styles.codeInputContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={[styles.codeInput, { textAlign: 'center' }]}
                  value={digit}
                  onChangeText={(value) => handleCodeChange(value, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  autoFocus={index === 0}
                />
              ))}
            </View>
          )}
        </Animated.View>

        {/* Timer */}
        {!isBackupMode && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              Code expires in {formatTime(timeLeft)}
            </Text>
          </View>
        )}

        {/* Verify Button */}
        <Button
          onPress={() => handleVerify()}
          loading={loading}
          disabled={isBackupMode ? backupCode.length !== 8 : code.some(digit => !digit)}
          style={styles.verifyButton}
        >
          {`Verify ${isBackupMode ? 'Backup Code' : 'Code'}`}
        </Button>

        {/* Toggle Mode */}
        <TouchableOpacity onPress={toggleBackupMode} style={styles.toggleButton}>
          <Text style={styles.toggleText}>
            {isBackupMode 
              ? 'Use authenticator app instead'
              : 'Use backup code instead'
            }
          </Text>
        </TouchableOpacity>

        {/* Resend Code */}
        {!isBackupMode && (
          <TouchableOpacity 
            onPress={() => {
              setTimeLeft(30);
              setCanResend(false);
              Alert.alert('Code Refreshed', 'Please check your authenticator app for a new code.');
            }}
            disabled={!canResend}
            style={[styles.resendButton, !canResend && styles.disabledButton]}
          >
            <Text style={[styles.resendText, !canResend && styles.disabledText]}>
              {canResend ? 'Get new code' : 'Wait for new code'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Help Section */}
      <Card style={styles.helpCard}>
        <View style={styles.helpHeader}>
          <Ionicons name="help-circle" size={20} color="#666" />
          <Text style={styles.helpTitle}>Need Help?</Text>
        </View>
        <Text style={styles.helpText}>
          • Make sure your device's time is correct{'\n'}
          • Try refreshing your authenticator app{'\n'}
          • Use a backup code if you can't access your authenticator
        </Text>
      </Card>
    </View>
  );
}

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
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 240,
  },
  codeInput: {
    width: 35,
    height: 50,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'white',
  },
  backupCodeInput: {
    width: 200,
    height: 50,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    fontSize: 18,
    fontWeight: '600',
    backgroundColor: 'white',
    paddingHorizontal: 12,
  },
  timerContainer: {
    marginBottom: 20,
  },
  timerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  verifyButton: {
    width: '100%',
    marginBottom: 20,
  },
  toggleButton: {
    padding: 12,
    marginBottom: 10,
  },
  toggleText: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
  },
  resendButton: {
    padding: 12,
  },
  resendText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#999',
  },
  helpCard: {
    margin: 20,
    padding: 16,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#666',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});