import { User, Subscription } from './types';

// This is a mock API to simulate fetching subscription data from Stripe.
// In a real application, this would be a secure call to your backend,
// which would then communicate with the Stripe API.

const addMonths = (date: Date, months: number): Date => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
};

export const getSubscriptions = async (users: User[]): Promise<Subscription[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return users.map(user => {
        const startDate = user.lastLogin ? new Date(user.lastLogin) : new Date();
        const endDate = addMonths(startDate, 1);
        
        // Make some users past_due for realism
        const isPastDue = Math.random() < 0.1 && user.plan !== 'free';

        return {
            id: `sub_${user.uid}`,
            userId: user.uid,
            userEmail: user.email,
            plan: user.plan,
            status: isPastDue ? 'past_due' : user.subscriptionStatus,
            currentPeriodStart: startDate.toISOString(),
            currentPeriodEnd: endDate.toISOString(),
        };
    });
};