"use client";

import { useState, useEffect } from 'react'
import { Card } from '@repo/ui/components/ui/card'
import { Input } from '@repo/ui/components/ui/input'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert"
import { toast } from '@repo/ui/hooks/use-toast'
import AuthPopup from "../authentication"
import { useAuthLimit } from '@/hooks/use-auth-check';

interface HashtagGroup {
  name: string
  tags: string[]
}

const DEFAULT_GROUPS: HashtagGroup[] = [
  {
    name: "Photography",
    tags: ["#photography", "#photooftheday", "#photographer", "#nature", "#photo"]
  },
  {
    name: "Fashion",
    tags: ["#fashion", "#style", "#ootd", "#model", "#fashionblogger"]
  },
  {
    name: "Food",
    tags: ["#food", "#foodporn", "#foodie", "#instafood", "#yummy"]
  }
];

const LOCAL_STORAGE_KEY = 'user_hashtag_groups';

export const HashtagGenerator = () => {
  const [groups, setGroups] = useState<HashtagGroup[]>(DEFAULT_GROUPS)
  const [newTag, setNewTag] = useState('')
  const [newGroupName, setNewGroupName] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>('Photography')
  const [isAddingGroup, setIsAddingGroup] = useState(false)

  const {
    isAuthenticated,
    showAuthPopup,
    setShowAuthPopup,
    checkUsageLimit,
    incrementUsage,
    handleSuccessfulAuth,
    remainingUses
  } = useAuthLimit({
    toolId: 'hashtag-generator',
    dailyLimit: 2
  });

  // Load saved groups from localStorage
  useEffect(() => {
    const savedGroups = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedGroups) {
      try {
        const parsedGroups = JSON.parse(savedGroups);
        setGroups(parsedGroups);
        setSelectedGroup(parsedGroups[0]?.name || 'Photography');
      } catch (error) {
        console.error('Error loading saved groups:', error);
      }
    }
  }, []);

  // Save groups to localStorage when they change
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(groups));
    }
  }, [groups, isAuthenticated]);

  const copyToClipboard = async (tags: string[]) => {
    if (!checkUsageLimit()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(tags.join(' '));

      if (!isAuthenticated) {
        incrementUsage();
      }

      toast({
        title: "Hashtags copied!",
        description: "You can now paste them into your post"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy hashtags",
        variant: "destructive"
      });
    }
  };

  const getCurrentGroup = () => groups.find(g => g.name === selectedGroup);

  const addNewTag = () => {
    if (!newTag.trim()) {
      toast({
        title: "Error",
        description: "Please enter a hashtag",
        variant: "destructive"
      });
      return;
    }

    const formattedTag = newTag.startsWith('#') ? newTag : `#${newTag}`;

    setGroups(groups.map(group =>
      group.name === selectedGroup
        ? {
          ...group,
          tags: group.tags.includes(formattedTag)
            ? group.tags
            : [...group.tags, formattedTag]
        }
        : group
    ));
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to edit hashtag groups",
        variant: "destructive"
      });
      setShowAuthPopup(true);
      return;
    }

    setGroups(groups.map(group =>
      group.name === selectedGroup
        ? { ...group, tags: group.tags.filter(tag => tag !== tagToRemove) }
        : group
    ));
  };

  const addNewGroup = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create new groups",
        variant: "destructive"
      });
      setShowAuthPopup(true);
      return;
    }

    if (!newGroupName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a group name",
        variant: "destructive"
      });
      return;
    }

    if (groups.some(g => g.name.toLowerCase() === newGroupName.toLowerCase())) {
      toast({
        title: "Error",
        description: "A group with this name already exists",
        variant: "destructive"
      });
      return;
    }

    setGroups([...groups, { name: newGroupName, tags: [] }]);
    setSelectedGroup(newGroupName);
    setNewGroupName('');
    setIsAddingGroup(false);
  };

  const removeGroup = (groupName: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to remove groups",
        variant: "destructive"
      });
      setShowAuthPopup(true);
      return;
    }

    if (groups.length <= 1) {
      toast({
        title: "Error",
        description: "Cannot remove the last group",
        variant: "destructive"
      });
      return;
    }

    const newGroups = groups.filter(g => g.name !== groupName);
    setGroups(newGroups);
    setSelectedGroup(newGroups[0].name);
  };

  return (
    <Card className="p-6">
      {!isAuthenticated && (
        <Alert className="mb-4">
          <AlertDescription>
            You have {remainingUses} free copies remaining today. Sign in for unlimited access and to save your custom groups.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 items-center">
          {groups.map(group => (
            <div key={group.name} className="flex items-center gap-1">
              <Button
                variant={selectedGroup === group.name ? "default" : "outline"}
                onClick={() => setSelectedGroup(group.name)}
                className="relative"
              >
                {group.name}
                {isAuthenticated && groups.length > 1 && (
                  <span
                    className="ml-2 text-xs cursor-pointer hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeGroup(group.name);
                    }}
                  >
                    ×
                  </span>
                )}
              </Button>
            </div>
          ))}
          {isAuthenticated && (
            <Button
              variant="outline"
              onClick={() => setIsAddingGroup(true)}
              className="text-green-600 hover:text-green-700"
            >
              + Add Group
            </Button>
          )}
        </div>

        {isAddingGroup && (
          <div className="flex gap-2">
            <Input
              placeholder="New group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <Button onClick={addNewGroup}>Add</Button>
            <Button variant="outline" onClick={() => setIsAddingGroup(false)}>
              Cancel
            </Button>
          </div>
        )}

        <div>
          <h3 className="text-lg font-medium mb-2">Current Group Hashtags:</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {getCurrentGroup()?.tags.map(tag => (
              <Badge
                key={tag}
                variant="secondary"
                className="group"
              >
                {tag}
                {isAuthenticated && (
                  <span
                    className="ml-2 opacity-0 group-hover:opacity-100 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    ×
                  </span>
                )}
              </Badge>
            ))}
          </div>
          <Button
            onClick={() => copyToClipboard(getCurrentGroup()?.tags || [])}
            className="w-full"
            disabled={!getCurrentGroup()?.tags.length || (!isAuthenticated && remainingUses <= 0)}
          >
            Copy All Hashtags
          </Button>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Add new hashtag (e.g., #travel)"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addNewTag()}
          />
          <Button onClick={addNewTag}>
            Add
          </Button>
        </div>
      </div>

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={handleSuccessfulAuth}
      />
    </Card>
  )
}