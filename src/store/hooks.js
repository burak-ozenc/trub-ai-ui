import { useDispatch, useSelector } from 'react-redux';

// Typed hooks for better developer experience
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;