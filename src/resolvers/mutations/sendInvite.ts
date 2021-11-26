import { ResolverContext } from '../../typings'
import { MutationResponse, SendInviteInput } from '../resolvertypes'

export async function sendInvite(
    _: any,
    args: SendInviteInput,
    { request, prisma }: ResolverContext,
): Promise<MutationResponse> {
    try {
        const userId = request.session.userId
        if (!userId) {
            return { status: 'NOT_OK', error: 'User is not authenticated' }
        }

        let alreadyFound = await prisma.invite.findMany({
            where: {
                fromUser: { id: userId },
                toUser: args.to,
                event: { id: args.event },
            },
        })

        if (alreadyFound && alreadyFound.length > 0) {
            await prisma.invite.delete({
                where: {
                    id: alreadyFound[0].id,
                },
            })
            return { status: 'OK', error: null }
        }

        const newInvite = await prisma.invite.create({
            data: {
                fromUser: { connect: { id: userId } },
                status: false,
                toUser: args.to,
                event: { connect: { id: args.event } },
            },
        })
        if (!newInvite)
            return { status: 'NOT_OK', error: 'Error sending an invite' }

        return { status: 'OK', error: null }
    } catch (error) {
        console.log(error.message)
        return { status: 'NOT_OK', error: error.message }
    }
}
