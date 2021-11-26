import { ResolverContext } from '../../typings'
import { MutationResponse } from '../resolvertypes'

export async function deleteEvent(
    _: any,
    args: { event: number },
    { request, prisma }: ResolverContext,
): Promise<MutationResponse> {
    try {
        const userId = request.session.userId
        if (!userId) {
            return { status: 'NOT_OK', error: 'User is not authenticated' }
        }

        const deleteInvites = prisma.invite.deleteMany({
            where: {
                event: { id: args.event },
            },
        })

        const attendingEvents = prisma.attendEvents.deleteMany({
            where: { event: { id: args.event } },
        })

        const deletedEvent = prisma.event.delete({
            where: { id: args.event },
        })

        await prisma.$transaction([
            deleteInvites,
            attendingEvents,
            deletedEvent,
        ])

        return { status: 'OK', error: null }
    } catch (error) {
        console.log(error.message)
        return { status: 'NOT_OK', error: error.message }
    }
}
