import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ScannedContact } from '../types/contact';

interface ReviewScreenProps {
  scannedContact: ScannedContact;
  onSave: (contact: ScannedContact) => void;
  onCancel: () => void;
}

const ReviewScreen: React.FC<ReviewScreenProps> = ({
  scannedContact,
  onSave,
  onCancel,
}) => {
  const [editedContact, setEditedContact] =
    useState<ScannedContact>(scannedContact);

  useEffect(() => {
    setEditedContact(scannedContact);
  }, [scannedContact]);

  const handleChangeText = (field: keyof ScannedContact, value: string) => {
    setEditedContact(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (
    field: 'phoneNumbers' | 'emails',
    index: number,
    value: string,
  ) => {
    const updatedArray = [...editedContact[field]];
    updatedArray[index] = value;
    setEditedContact(prev => ({
      ...prev,
      [field]: updatedArray,
    }));
  };

  const addArrayItem = (field: 'phoneNumbers' | 'emails') => {
    setEditedContact(prev => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (field: 'phoneNumbers' | 'emails', index: number) => {
    const updatedArray = editedContact[field].filter((_, i) => i !== index);
    setEditedContact(prev => ({ ...prev, [field]: updatedArray }));
  };

  const validateAndSave = () => {
    if (
      editedContact.phoneNumbers.filter(Boolean).length === 0 &&
      editedContact.emails.filter(Boolean).length === 0
    ) {
      Alert.alert(
        'Validation Error',
        'Please enter at least one phone number or email address.',
      );
      return;
    }

    const finalContact: ScannedContact = {
      ...editedContact,
      phoneNumbers: editedContact.phoneNumbers
        .filter(Boolean)
        .map(num => num.trim()),
      emails: editedContact.emails.filter(Boolean).map(email => email.trim()),
    };

    onSave(finalContact);
  };

  const renderInputField = (
    label: string,
    value: string | undefined,
    field: keyof ScannedContact,
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}:</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={text => handleChangeText(field, text)}
        placeholder={`Enter ${label.toLowerCase()}`}
        autoCapitalize={field === 'name' ? 'words' : 'none'}
        keyboardType={field === 'phoneNumbers' ? 'phone-pad' : 'default'}
      />
    </View>
  );

  const renderArrayField = (
    label: string,
    items: string[],
    field: 'phoneNumbers' | 'emails',
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}:</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.arrayItemContainer}>
          <TextInput
            style={[styles.input, styles.arrayInput]}
            value={item}
            onChangeText={text => handleArrayChange(field, index, text)}
            placeholder={`Enter ${label.toLowerCase().slice(0, -1)}`}
            keyboardType={
              field === 'phoneNumbers' ? 'phone-pad' : 'email-address'
            }
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => removeArrayItem(field, index)}
            style={styles.removeButton}
          >
            <Icon name="remove-circle-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        onPress={() => addArrayItem(field)}
        style={styles.addButton}
      >
        <Icon name="add-circle-outline" size={24} color="#007AFF" />
        <Text style={styles.addButtonText}>Add {label.slice(0, -1)}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.fullScreen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Review & Edit Contact</Text>

        {renderInputField('Name', editedContact.name, 'name')}
        {renderInputField('Job Title', editedContact.jobTitle, 'jobTitle')}
        {renderInputField('Company', editedContact.company, 'company')}

        {renderArrayField(
          'Phone Numbers',
          editedContact.phoneNumbers,
          'phoneNumbers',
        )}
        {renderArrayField('Emails', editedContact.emails, 'emails')}

        {renderInputField('Website', editedContact.website, 'website')}
        {renderInputField('Address', editedContact.address, 'address')}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={validateAndSave}
          >
            <Text style={styles.buttonText}>Save Contact</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#555',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  arrayItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  arrayInput: {
    flex: 1,
    marginRight: 10,
  },
  removeButton: {
    padding: 5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#E6F0FF',
    marginTop: 5,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 5,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#6C757D',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ReviewScreen;
