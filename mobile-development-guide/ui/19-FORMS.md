# Forms with react-hook-form

**Version:** 1.0
**Last Updated:** 2024-11-30
**Complexity:** ⭐⭐⭐ (Medium)

---

## 1. Overview

react-hook-form + Zod ile type-safe form validation, controlled components ve error handling.

---

## 2. Basic Form Setup

**Login Form:**

```typescript
import React from "react";
import { View, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@components/ui/Input";
import { Button } from "@components/ui/Button";

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="E-posta"
            placeholder="ornek@email.com"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Şifre"
            placeholder="••••••••"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
            secureTextEntry
          />
        )}
      />

      <Button
        title="Giriş Yap"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        fullWidth
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
```

---

## 3. Complex Form with Nested Fields

**Profile Form:**

```typescript
import React from "react";
import { View, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Nested schema
const profileSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(2, "Ad en az 2 karakter olmalı"),
    lastName: z.string().min(2, "Soyad en az 2 karakter olmalı"),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Geçerli tarih girin"),
  }),
  contactInfo: z.object({
    email: z.string().email("Geçerli e-posta girin"),
    phone: z.string().regex(/^[0-9]{10}$/, "Geçerli telefon numarası girin"),
  }),
  address: z.object({
    city: z.string().min(2),
    district: z.string().min(2),
    street: z.string().optional(),
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfileForm: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      personalInfo: {
        firstName: "",
        lastName: "",
        birthDate: "",
      },
      contactInfo: {
        email: "",
        phone: "",
      },
      address: {
        city: "",
        district: "",
        street: "",
      },
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    console.log(data);
  };

  return (
    <ScrollView>
      <View>
        {/* Personal Info */}
        <Controller
          control={control}
          name="personalInfo.firstName"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Ad"
              value={value}
              onChangeText={onChange}
              error={errors.personalInfo?.firstName?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="personalInfo.lastName"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Soyad"
              value={value}
              onChangeText={onChange}
              error={errors.personalInfo?.lastName?.message}
            />
          )}
        />

        {/* Contact Info */}
        <Controller
          control={control}
          name="contactInfo.email"
          render={({ field: { onChange, value } }) => (
            <Input
              label="E-posta"
              value={value}
              onChangeText={onChange}
              error={errors.contactInfo?.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="contactInfo.phone"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Telefon"
              value={value}
              onChangeText={onChange}
              error={errors.contactInfo?.phone?.message}
              keyboardType="phone-pad"
            />
          )}
        />

        <Button title="Kaydet" onPress={handleSubmit(onSubmit)} />
      </View>
    </ScrollView>
  );
};
```

---

## 4. Dynamic Form Fields

**Add/Remove Fields:**

```typescript
import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@components/ui/Input";
import { Button } from "@components/ui/Button";

const experienceSchema = z.object({
  experiences: z.array(
    z.object({
      company: z.string().min(2, "Şirket adı gerekli"),
      position: z.string().min(2, "Pozisyon gerekli"),
      years: z.number().min(0).max(50),
    })
  ),
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

export const ExperienceForm: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      experiences: [{ company: "", position: "", years: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "experiences",
  });

  const onSubmit = (data: ExperienceFormData) => {
    console.log(data);
  };

  return (
    <View>
      {fields.map((field, index) => (
        <View key={field.id}>
          <Controller
            control={control}
            name={`experiences.${index}.company`}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Şirket"
                value={value}
                onChangeText={onChange}
                error={errors.experiences?.[index]?.company?.message}
              />
            )}
          />

          <Controller
            control={control}
            name={`experiences.${index}.position`}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Pozisyon"
                value={value}
                onChangeText={onChange}
                error={errors.experiences?.[index]?.position?.message}
              />
            )}
          />

          <TouchableOpacity onPress={() => remove(index)}>
            <Text>Sil</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Button
        title="Deneyim Ekle"
        onPress={() => append({ company: "", position: "", years: 0 })}
        variant="outline"
      />

      <Button title="Kaydet" onPress={handleSubmit(onSubmit)} />
    </View>
  );
};
```

---

## 5. Custom Validation

**Conditional Validation:**

```typescript
import { z } from "zod";

const registerSchema = z
  .object({
    userType: z.enum(["student", "professional"]),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string(),
    // Student fields
    university: z.string().optional(),
    studentId: z.string().optional(),
    // Professional fields
    company: z.string().optional(),
    title: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.userType === "student") {
        return !!data.university && !!data.studentId;
      }
      return true;
    },
    {
      message: "Öğrenci bilgileri gerekli",
      path: ["university"],
    }
  )
  .refine(
    (data) => {
      if (data.userType === "professional") {
        return !!data.company && !!data.title;
      }
      return true;
    },
    {
      message: "Profesyonel bilgileri gerekli",
      path: ["company"],
    }
  );
```

---

## 6. Async Validation

**Check Email Availability:**

```typescript
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiClient } from "@core/api/client";

const emailSchema = z.object({
  email: z.string().email("Geçerli e-posta girin"),
});

type EmailFormData = z.infer<typeof emailSchema>;

export const EmailForm: React.FC = () => {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isValidating },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const checkEmailAvailability = async (email: string): Promise<boolean> => {
    try {
      const response = await apiClient.get("/auth/check-email", {
        params: { email },
      });
      return response.data.available;
    } catch {
      return false;
    }
  };

  const onSubmit = async (data: EmailFormData) => {
    const isAvailable = await checkEmailAvailability(data.email);

    if (!isAvailable) {
      setError("email", {
        type: "manual",
        message: "Bu e-posta zaten kullanılıyor",
      });
      return;
    }

    // Continue with registration
  };

  return (
    <View>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <Input
            label="E-posta"
            value={value}
            onChangeText={onChange}
            error={errors.email?.message}
            disabled={isValidating}
          />
        )}
      />

      <Button title="Devam" onPress={handleSubmit(onSubmit)} />
    </View>
  );
};
```

---

## 7. Form with File Upload

**Image Upload Form:**

```typescript
import React, { useState } from "react";
import { View, Image, TouchableOpacity, Text } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { imagePickerService } from "@core/media/imagePicker";
import { mediaUploader } from "@core/media/uploader";

const postSchema = z.object({
  title: z.string().min(3, "Başlık en az 3 karakter olmalı"),
  content: z.string().min(10, "İçerik en az 10 karakter olmalı"),
  imageUrl: z.string().url().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

export const PostForm: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });

  const handleImagePick = async () => {
    const images = await imagePickerService.pickFromGallery({
      mediaType: "photo",
      selectionLimit: 1,
    });

    if (images.length > 0) {
      setSelectedImage(images[0].uri);

      // Upload image
      setUploading(true);
      try {
        const url = await mediaUploader.uploadImage(images[0]);
        setValue("imageUrl", url);
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  const onSubmit = async (data: PostFormData) => {
    console.log("Post data:", data);
  };

  return (
    <View>
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Başlık"
            value={value}
            onChangeText={onChange}
            error={errors.title?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="content"
        render={({ field: { onChange, value } }) => (
          <Input
            label="İçerik"
            value={value}
            onChangeText={onChange}
            error={errors.content?.message}
            multiline
            numberOfLines={4}
          />
        )}
      />

      <TouchableOpacity onPress={handleImagePick} disabled={uploading}>
        <Text>{uploading ? "Yükleniyor..." : "Görsel Seç"}</Text>
      </TouchableOpacity>

      {selectedImage && (
        <Image
          source={{ uri: selectedImage }}
          style={{ width: 200, height: 200, marginTop: 12 }}
        />
      )}

      <Button title="Paylaş" onPress={handleSubmit(onSubmit)} />
    </View>
  );
};
```

---

## 8. Form State Management

**Multi-step Form:**

```typescript
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const steps = ["Personal", "Contact", "Address"];

export const MultiStepForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { control, handleSubmit, trigger } = useForm();

  const handleNext = async () => {
    // Validate current step
    const isValid = await trigger();

    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: any) => {
    console.log("Final data:", data);
  };

  return (
    <View>
      <Text>
        Step {currentStep + 1} of {steps.length}
      </Text>

      {/* Render current step fields */}
      {currentStep === 0 && <PersonalInfoFields control={control} />}
      {currentStep === 1 && <ContactInfoFields control={control} />}
      {currentStep === 2 && <AddressFields control={control} />}

      <View style={{ flexDirection: "row", gap: 8 }}>
        {currentStep > 0 && (
          <Button title="Geri" onPress={handleBack} variant="outline" />
        )}

        {currentStep < steps.length - 1 ? (
          <Button title="İleri" onPress={handleNext} />
        ) : (
          <Button title="Kaydet" onPress={handleSubmit(onSubmit)} />
        )}
      </View>
    </View>
  );
};
```

---

## 9. Summary

### Features:

- ✅ react-hook-form integration
- ✅ Zod validation schema
- ✅ Nested form fields
- ✅ Dynamic fields (add/remove)
- ✅ Custom validation
- ✅ Async validation
- ✅ File upload forms
- ✅ Multi-step forms
- ✅ Type-safe with TypeScript

**Result:** Powerful, type-safe form management with validation.
