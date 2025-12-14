// src/features/feed/components/PostImages.tsx
// Post görselleri komponenti - Backend API uyumlu
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React, { memo, useCallback, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
  Modal,
  FlatList,
  Text,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_GAP = 2;

interface PostImagesProps {
  images: string[]; // Backend API: string[] (S3 URLs)
  postId: number; // Backend API: postId: number
}

export const PostImages: React.FC<PostImagesProps> = memo(({ images, postId }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { width: screenWidth } = useWindowDimensions();

  const openImage = useCallback((index: number) => {
    setSelectedIndex(index);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  // Tek görsel
  if (images.length === 1) {
    const imageUrl = images[0];

    return (
      <>
        <Pressable onPress={() => openImage(0)}>
          <Image
            source={{ uri: imageUrl }}
            style={[styles.singleImage, { height: 300, width: screenWidth }]}
            resizeMode="cover"
          />
        </Pressable>
        <ImageModal
          visible={modalVisible}
          images={images}
          initialIndex={selectedIndex}
          onClose={closeModal}
        />
      </>
    );
  }

  // İki görsel
  if (images.length === 2) {
    return (
      <>
        <View style={styles.twoImages}>
          {images.map((imageUrl, index) => (
            <Pressable
              key={`${postId}-image-${index}`}
              style={styles.twoImageItem}
              onPress={() => openImage(index)}>
              <Image source={{ uri: imageUrl }} style={styles.twoImageContent} resizeMode="cover" />
            </Pressable>
          ))}
        </View>
        <ImageModal
          visible={modalVisible}
          images={images}
          initialIndex={selectedIndex}
          onClose={closeModal}
        />
      </>
    );
  }

  // Üç görsel
  if (images.length === 3) {
    return (
      <>
        <View style={styles.threeImages}>
          <Pressable style={styles.threeImageMain} onPress={() => openImage(0)}>
            <Image
              source={{ uri: images[0] }}
              style={styles.threeImageMainContent}
              resizeMode="cover"
            />
          </Pressable>
          <View style={styles.threeImageSide}>
            {images.slice(1).map((imageUrl, index) => (
              <Pressable
                key={`${postId}-image-${index + 1}`}
                style={styles.threeImageSideItem}
                onPress={() => openImage(index + 1)}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.threeImageSideContent}
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          </View>
        </View>
        <ImageModal
          visible={modalVisible}
          images={images}
          initialIndex={selectedIndex}
          onClose={closeModal}
        />
      </>
    );
  }

  // Dört veya daha fazla görsel
  return (
    <>
      <View style={styles.fourImages}>
        {images.slice(0, 4).map((imageUrl, index) => (
          <Pressable
            key={`${postId}-image-${index}`}
            style={styles.fourImageItem}
            onPress={() => openImage(index)}>
            <Image source={{ uri: imageUrl }} style={styles.fourImageContent} resizeMode="cover" />
            {index === 3 && images.length > 4 && (
              <View style={styles.moreOverlay}>
                <Text style={styles.moreText}>+{images.length - 4}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>
      <ImageModal
        visible={modalVisible}
        images={images}
        initialIndex={selectedIndex}
        onClose={closeModal}
      />
    </>
  );
});

PostImages.displayName = 'PostImages';

// Full screen image modal
interface ImageModalProps {
  visible: boolean;
  images: string[]; // Backend API: string[] (S3 URLs)
  initialIndex: number;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ visible, images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const { width: screenWidth } = useWindowDimensions();

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }, []);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <StatusBar hidden />
      <View style={styles.modalContainer}>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={28} color="#FFFFFF" />
        </Pressable>

        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          renderItem={({ item: imageUrl, index: _index }) => (
            <View style={[styles.modalImageContainer, { width: screenWidth }]}>
              <Image
                source={{ uri: imageUrl }}
                style={[styles.modalImage, { width: screenWidth }]}
                resizeMode="contain"
              />
            </View>
          )}
          keyExtractor={(_item, index) => `modal-image-${index}`}
        />

        {images.length > 1 && (
          <View style={styles.pagination}>
            <Text style={styles.paginationText}>
              {currentIndex + 1} / {images.length}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    padding: 8,
    position: 'absolute',
    right: 16,
    top: 50,
    zIndex: 1,
  },
  fourImageContent: {
    flex: 1,
  },
  fourImageItem: {
    height: '50%',
    padding: IMAGE_GAP / 2,
    width: '50%',
  },
  fourImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: 250,
    width: '100%',
  },
  modalContainer: {
    backgroundColor: '#000000',
    flex: 1,
  },
  modalImage: {
    height: SCREEN_HEIGHT * 0.8,
  },
  modalImageContainer: {
    alignItems: 'center',
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
  },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    margin: IMAGE_GAP / 2,
  },
  moreText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  pagination: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    bottom: 50,
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'absolute',
  },
  paginationText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  singleImage: {
    width: '100%',
  },
  threeImageMain: {
    flex: 2,
    marginRight: IMAGE_GAP,
  },
  threeImageMainContent: {
    flex: 1,
  },
  threeImageSide: {
    flex: 1,
  },
  threeImageSideContent: {
    flex: 1,
  },
  threeImageSideItem: {
    flex: 1,
    marginBottom: IMAGE_GAP,
  },
  threeImages: {
    flexDirection: 'row',
    height: 250,
    width: '100%',
  },
  twoImageContent: {
    flex: 1,
  },
  twoImageItem: {
    flex: 1,
    marginHorizontal: IMAGE_GAP / 2,
  },
  twoImages: {
    flexDirection: 'row',
    height: 200,
    width: '100%',
  },
});

export default PostImages;
