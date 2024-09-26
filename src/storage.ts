import { useState, useEffect } from 'react';

const useLocalStorage = <T>(key: string, defaultValue: T) : [value: T, setValue: (input: T) => void] => {
	const [value, setValue] = useState<T>(() => {
		let currentValue;
		try {
			currentValue = JSON.parse(localStorage.getItem(key) || String(defaultValue));
		} catch (err) {
			currentValue = defaultValue;
		}
		return currentValue;
	});

	useEffect(() => {
		localStorage.setItem(key, JSON.stringify(value));
	}, [value, key]);

	return [value, setValue];
};

export default useLocalStorage;