import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';

const PagerView = forwardRef(({ children, initialPage = 0, onPageSelected, ...props }: any, ref) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();

  useImperativeHandle(ref, () => ({
    setPage: (page: number) => {
      scrollViewRef.current?.scrollTo({ x: page * width, animated: true });
      if (onPageSelected) {
         onPageSelected({ nativeEvent: { position: page } });
      }
    },
    setPageWithoutAnimation: (page: number) => {
      scrollViewRef.current?.scrollTo({ x: page * width, animated: false });
    }
  }));

  return (
    <ScrollView 
      ref={scrollViewRef}
      horizontal 
      pagingEnabled 
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={(e) => {
        const page = Math.round(e.nativeEvent.contentOffset.x / width);
        if (onPageSelected) {
           onPageSelected({ nativeEvent: { position: page } });
        }
      }}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <View style={{ width, flex: 1 }} key={index}>
          {child}
        </View>
      ))}
    </ScrollView>
  );
});

export default PagerView as any;
