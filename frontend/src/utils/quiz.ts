// utils/quiz.ts (или прямо в компонентах)
export const isOtherOption = (option: { text: string }): boolean => {
  return option.text.toLowerCase().includes('другое') || 
         option.text.toLowerCase().includes('other')
}