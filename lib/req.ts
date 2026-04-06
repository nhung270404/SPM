import axios from 'axios';

export async function POST_METHOD(url: string, body: unknown, token?: string) {
    const {data} = await axios.post(url, body, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : undefined,
            credentials: 'include',
        },
    });

    if (data && data.success && data.data) {
        return data.data;
    }

    return data;
}

export async function PUT_METHOD(url: string, body: unknown) {
    const {data} = await axios.put(url, body, {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (data && data.success && data.data) {
        return data.data;
    }

    return data;
}

export async function PATCH_METHOD(url: string, body: unknown) {
    const {data} = await axios.patch(url, body, {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (data && data.success && data.data) {
        return data.data;
    }

    return data;
}

export async function GET_METHOD(url: string, token?: string) {
    const {data} = await axios.get(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : undefined,
        },
        withCredentials: true,
    });
    if (data && data.success && data.data) {
        return data.data;
    }
    return data;
}

export async function DELETE_METHOD(url: string, token?: string) {
    const {data} = await axios.delete(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : undefined,
        },
        withCredentials: true,
    });
    if (data && data.success && data.data) {
        return data.data;
    }
    return data;
}
