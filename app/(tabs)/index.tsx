import { View, Text, Pressable } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-retro-dark">
      <View className="border-4 border-white bg-retro-purple p-8">
        <Text className="text-2xl text-white text-center mb-6 uppercase">
          🎮 Pepper DAO
        </Text>
        <Text className="text-sm text-white text-center mb-8">
          Welcome to Nativewind!
        </Text>
        
        <Pressable className="bg-retro-pink border-4 border-white px-8 py-4 mb-4 active:translate-x-1 active:translate-y-1">
          <Text className="text-white text-center uppercase text-xs tracking-wider">
            Start
          </Text>
        </Pressable>
        
        <Pressable className="bg-retro-blue border-4 border-white px-8 py-4 active:translate-x-1 active:translate-y-1">
          <Text className="text-white text-center uppercase text-xs tracking-wider">
            Options
          </Text>
        </Pressable>
      </View>
      
      <View className="mt-8 px-8">
        <Text className="text-retro-green text-center text-xs">
          ✨ Retro Gaming UI Powered by NativeWind ✨
        </Text>
      </View>
    </View>
  );
}
