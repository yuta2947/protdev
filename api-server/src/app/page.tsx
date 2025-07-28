'use client';
import { useEffect } from 'react';

export default function RootPage() {
    useEffect(() => {
        window.location.href = '/pages/index.html';
    }, []);

    return(
    <div>
      <p>リダイレクト中...</p>
    </div>
    );
}